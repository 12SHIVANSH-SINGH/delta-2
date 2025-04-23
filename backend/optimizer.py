# backend/optimizer.py

import logging
import time
from typing import Dict, Any, List, Tuple
from collections import deque

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("optimizer")

class TrafficOptimizer:
    def __init__(self):
        # Configuration parameters
        self.min_green = 5          # Minimum green time per lane in seconds  
        self.max_green = 60         # Maximum green time per lane in seconds
        self.cycle_time = 180       # Total cycle time target in seconds
        self.emergency_priority = 0.7  # Portion of cycle given to emergency lanes
        
        # Traffic history for pattern detection
        self.history_window = 10    # Number of cycles to keep in history
        self.history = {}           # Lane -> deque of recent counts
        
        # Weights for various factors
        self.count_weight = 0.6     # Weight for current vehicle count
        self.trend_weight = 0.3     # Weight for traffic trend (increasing/decreasing)
        self.wait_weight = 0.1      # Weight for wait time since last green
        
        # Track last green times for each lane
        self.last_green = {}        # Lane -> timestamp of last green
        
        # Performance metrics
        self.computation_times = deque(maxlen=100)  # Track optimization time
        
        logger.info("TrafficOptimizer initialized")

    def compute_green_time(self, data: dict) -> dict:
        """
        Compute optimal green times for each lane based on traffic data.
        
        Args:
            data: Dictionary with lane data {lane_name: {'count': int, 'emergency': bool}}
            
        Returns:
            Dictionary with green times {lane_name: seconds}
        """
        start_time = time.time()
        
        try:
            # Update history
            self._update_history(data)
            
            # Initialize result with default allocation
            total = sum(self.min_green for _ in data)
            remaining = self.cycle_time - total
            if remaining < 0:
                logger.warning(f"Min green times exceed cycle time: {total} > {self.cycle_time}")
                # Scale down proportionally if needed
                scale = self.cycle_time / total
                times = {lane: max(1, int(self.min_green * scale)) for lane in data}
                return times
                
            times = {lane: self.min_green for lane in data}
            
            # First, check for any emergency vehicles
            em_lanes = [l for l, v in data.items() if v.get('emergency', False)]
            
            if em_lanes:
                # Handle emergency vehicle priority
                return self._handle_emergency(data, em_lanes, times, remaining)
            else:
                # No emergency: distribute based on counts, trends, and wait times
                return self._optimize_normal_traffic(data, times, remaining)
                
        except Exception as e:
            logger.error(f"Error in compute_green_time: {e}")
            # Fallback to equal distribution on error
            even_time = max(self.min_green, self.cycle_time // max(1, len(data)))
            return {lane: even_time for lane in data}
        finally:
            # Track performance
            comp_time = time.time() - start_time
            self.computation_times.append(comp_time)
            if len(self.computation_times) % 50 == 0:
                avg_time = sum(self.computation_times) / len(self.computation_times)
                logger.info(f"Optimizer average computation time: {avg_time:.4f}s")

    def _handle_emergency(self, data: dict, em_lanes: List[str], 
                         base_times: Dict[str, int], remaining: int) -> Dict[str, int]:
        """Handle traffic with emergency vehicles present."""
        times = base_times.copy()
        
        # Prioritize the first emergency lane encountered
        p = em_lanes[0]
        if len(em_lanes) > 1:
            logger.info(f"Multiple emergency vehicles detected in lanes: {em_lanes}")
            
        # Calculate how much time to allocate to emergency lane
        # Allocate up to emergency_priority * cycle_time, but ensure others get min_green
        other_min = sum(self.min_green for lane in data if lane != p)
        max_emergency = self.cycle_time - other_min
        
        # Calculate desired emergency time
        target_emergency = min(
            int(self.emergency_priority * self.cycle_time),
            max_emergency,
            self.max_green  # Cap at max_green
        )
        
        # Add remaining time to emergency lane
        times[p] += min(remaining, target_emergency - times[p])
        remaining -= (times[p] - base_times[p])
        
        if remaining > 0:
            # Distribute any remaining time to other lanes proportionally by count
            non_em_lanes = [l for l in data if l != p]
            if non_em_lanes:
                counts = {l: data[l].get('count', 0) for l in non_em_lanes}
                total_count = sum(counts.values())
                
                if total_count > 0:
                    for lane in non_em_lanes:
                        # Proportional allocation of remaining time
                        add_time = int(remaining * counts[lane] / total_count)
                        times[lane] += add_time
                        remaining -= add_time
                        
                # Distribute any leftover seconds
                for lane in sorted(non_em_lanes, key=lambda l: times[l]):
                    if remaining <= 0:
                        break
                    times[lane] += 1
                    remaining -= 1
                    
        # Update last green times
        current_time = time.time()
        for lane in times:
            if lane == p or times[lane] > self.min_green:
                self.last_green[lane] = current_time
                
        logger.info(f"Emergency in lane {p}: allocated {times[p]}s")
                
        return times

    def _optimize_normal_traffic(self, data: dict, base_times: Dict[str, int], 
                               remaining: int) -> Dict[str, int]:
        """Optimize traffic without emergency vehicles."""
        times = base_times.copy()
        
        # Calculate scores based on multiple factors
        scores = {}
        for lane, info in data.items():
            count = info.get('count', 0)
            
            # Get trend (rate of change)
            trend = self._calculate_trend(lane)
            
            # Calculate wait time factor
            wait_factor = self._calculate_wait_factor(lane)
            
            # Combined score
            scores[lane] = (
                count * self.count_weight + 
                trend * self.trend_weight + 
                wait_factor * self.wait_weight
            )
            
        # Normalize scores
        total_score = sum(scores.values()) if sum(scores.values()) > 0 else 1
        norm_scores = {lane: score / total_score for lane, score in scores.items()}
        
        # Distribute remaining time based on normalized scores
        for lane, score in norm_scores.items():
            # Allocate proportionally to score
            add_time = int(remaining * score)
            
            # Cap at max_green
            add_time = min(add_time, self.max_green - times[lane])
            
            times[lane] += add_time
            remaining -= add_time
            
        # Distribute any leftover seconds to lanes with highest scores
        if remaining > 0:
            # Sort lanes by score (highest first)
            sorted_lanes = sorted(norm_scores.keys(), key=lambda l: norm_scores[l], reverse=True)
            
            for lane in sorted_lanes:
                if remaining <= 0 or times[lane] >= self.max_green:
                    continue
                
                # Add one second at a time
                times[lane] += 1
                remaining -= 1
                
                if remaining <= 0:
                    break
        
        # Update last green times
        current_time = time.time()
        for lane in times:
            if times[lane] > self.min_green:
                self.last_green[lane] = current_time
                
        # Log results
        logger.info(f"Normal optimization: {times}")
        
        return times
        
    def _update_history(self, data: dict) -> None:
        """Update traffic history for trend analysis."""
        current_time = time.time()
        
        for lane, info in data.items():
            count = info.get('count', 0)
            
            # Initialize history for new lanes
            if lane not in self.history:
                self.history[lane] = deque(maxlen=self.history_window)
                self.last_green[lane] = current_time - 60  # Default: assume green 60s ago
                
            # Add current count to history
            self.history[lane].append((current_time, count))
            
            # Clean up old entries (> 30 minutes)
            while (self.history[lane] and 
                   current_time - self.history[lane][0][0] > 1800):
                self.history[lane].popleft()
    
    def _calculate_trend(self, lane: str) -> float:
        """Calculate traffic trend (positive = increasing, negative = decreasing)."""
        if lane not in self.history or len(self.history[lane]) < 2:
            return 0.0
            
        # Get slope of linear regression over recent history
        history = list(self.history[lane])
        if len(history) < 2:
            return 0.0
            
        # Simple slope calculation using first and last points
        first_time, first_count = history[0]
        last_time, last_count = history[-1]
        
        # Avoid division by zero
        time_diff = last_time - first_time
        if time_diff < 0.001:
            return 0.0
            
        slope = (last_count - first_count) / time_diff
        
        # Normalize to [-1, 1] range
        normalized_slope = max(-1.0, min(1.0, slope * 5))
        
        return normalized_slope
        
    def _calculate_wait_factor(self, lane: str) -> float:
        """Calculate wait time factor based on time since last green."""
        current_time = time.time()
        
        # Default wait time if no history
        if lane not in self.last_green:
            return 1.0
            
        # Calculate minutes since last green
        minutes_waiting = (current_time - self.last_green[lane]) / 60.0
        
        # Scale factor: increases with wait time but caps at 3
        wait_factor = min(3.0, minutes_waiting / 2.0)
        
        return wait_factor

    def get_metrics(self) -> dict:
        """Return performance metrics for the optimizer."""
        return {
            "avg_computation_time": sum(self.computation_times) / max(1, len(self.computation_times)),
            "history_size": {lane: len(hist) for lane, hist in self.history.items()},
            "last_green": self.last_green
        }

    def reset(self) -> None:
        """Reset optimizer state."""
        self.history = {}
        self.last_green = {}
        self.computation_times.clear()
        logger.info("Traffic optimizer reset")


# Create optimizer instance for export
optimizer = TrafficOptimizer()
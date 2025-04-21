class TrafficOptimizer:
    def __init__(self):
        self.min_green, self.max_green = 5, 60
        self.emergency_priority = 0.7

    def compute_green_time(self, data: dict) -> dict:
        total = self.max_green
        em_lanes = [l for l,v in data.items() if v['emergency']]
        if em_lanes:
            p = em_lanes[0]
            green_p = min(int(self.emergency_priority*total), total - self.min_green*(len(data)-1))
            times = {p: green_p}
            rem = total - green_p
            for l in data:
                if l!=p: times[l] = max(self.min_green, rem//(len(data)-1))
            return times

        tot_veh = sum(v['count'] for v in data.values())
        if tot_veh==0:
            return {l: total//len(data) for l in data}
        times = {l: max(self.min_green, int(v['count']/tot_veh*total))
                 for l,v in data.items()}
        diff = total - sum(times.values())
        while diff!=0:
            adj = 1 if diff>0 else -1
            key = min(times, key=times.get) if diff>0 else max(times, key=times.get)
            if times[key]+adj>=self.min_green:
                times[key]+=adj; diff-=adj
        return times

optimizer = TrafficOptimizer()
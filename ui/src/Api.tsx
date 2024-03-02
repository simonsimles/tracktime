import { Week } from "./WeekPicker"

export interface Project {
    projectId: string
    name: string
    jobNumbers: JobNumber[]
    isActive: boolean
    isChargeable: boolean
}

export interface JobNumber {
    jobNumber: string
    startDate?: string
    endDate?: string
}

export interface WorkWeek {
    week: string
    comment?: string
    work: Work[]
}

export interface Work {
    id: number
    date: string
    project: string
    period: IntervalPeriod | AbsolutePeriod
    comment?: string
}

export class Time {
    readonly hours: number = 0
    readonly minutes: number = 0

    constructor(hours?: number, minutes?: number) {
        this.hours = hours ?? 0
        this.minutes = minutes ?? 0
        if (this.minutes >= 60) {
            this.hours = this.hours + (Math.floor(this.minutes / 60))
            this.minutes = this.minutes % 60
        }
    }

    plus(other: Time): Time {
        if (other === undefined) { return this }
        return new Time(
            this.hours + other.hours + Math.floor((this.minutes + other.minutes) / 60),
            (this.minutes + other.minutes) % 60)
    }

    minus(other: Time): Time {
        if (other === undefined) { return this }
        return new Time(
            this.hours - other.hours -
            (other.minutes > this.minutes ? Math.ceil((other.minutes - this.minutes) / 60) : 0),
            this.minutes - other.minutes + (other.minutes > this.minutes ? 60 : 0))
    }

    toString() {
        return `${this.hours}:${this.minutes.toString().padStart(2, "0")}`
    }

    now(): Time {
        const d = new Date()
        return new Time(d.getHours(), d.getMinutes())
    }
}

export function getTimeFromString(ts?: string) {
    const m = ts?.match(/^(\d{0,2}):(\d{0,2})$/) ?? []
    if (m.length > 0) {
        return new Time(m[1].length > 0 ? Number(m[1]) : 0,
            m[2].length > 0 ? Number(m[2]) : 0)
    }
}


interface Period {
    totalTime(): Time
}

export class IntervalPeriod implements Period {
    start: Time
    end?: Time
    pause?: Time
    totalTime() { return (this.end ?? new Time().now()).minus(this.start).minus(this.pause ?? new Time(0, 0)) }

    constructor(start?: Time, end?: Time, pause?: Time) {
        this.start = start ?? new Time(0, 0)
        this.end = end
        this.pause = pause
    }
}

export class AbsolutePeriod implements Period {
    time: Time
    totalTime() { return this.time }

    constructor(time?: Time) {
        this.time = time ?? new Time(0, 0)
    }
}

function useActualObjectsInWorkJson(work: Work) {
    const isString = (x: any) => typeof x === 'string'
    const reParseTime = (x: any) => isString(x) ?
        getTimeFromString(x.toString()) ?? new Time() :
        Object.assign(new Time(), x)

    if (work.period) {
        if ("time" in work.period) {
            work.period.time = reParseTime(work.period.time)
            work.period = Object.assign(new AbsolutePeriod(), work.period)
        } else if ("start" in work.period) {
            work.period.start = reParseTime(work.period.start)
            if (work.period.end !== undefined) {
                work.period.end = reParseTime(work.period.end)
            }
            if (work.period.pause !== undefined) {
                work.period.pause = reParseTime(work.period.pause)
            }
            work.period = Object.assign(new IntervalPeriod(), work.period)
        }
    }
}

class ApiWrapper {
    async getProjects(): Promise<Project[]> {
        return fetch("api/projects").then(
            (r) => r.json(),
            (err) => console.error(err)
        )
    }

    async addOrUpdateProject(project: Project): Promise<Project> {
        return fetch("/api/projects", {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify(project)
        }).then(
            (r) => r.json(),
            (err) => console.error(err)
        )
    }

    async deleteProject(projectId: string): Promise<Project> {
        return fetch(`api/projects/${projectId}`, {
            method: "DELETE"
        }).then(
            (r) => r.json(),
            (err) => console.error(err)
        )
    }

    async getWorkWeek(week: Week): Promise<WorkWeek> {
        return fetch(`api/work/${week.year}/${week.week}`).then(
            (r) => {
                switch (r.status) {
                    case 200: return r.json().then(
                        parsed => {
                            if (parsed.work) {
                                parsed.work.forEach(useActualObjectsInWorkJson)
                            }
                            return parsed
                        })
                    case 204: return undefined
                    default: return undefined
                }
            },
            (err) => console.error(err)
        )
    }

    async getWorkForWeek(week: Week): Promise<Work[]> {
        return fetch(`api/work/${week.year}/${week.week}?onlyWork=yes`).then(
            (r) => r.json().then(parsed => {
                parsed.forEach(useActualObjectsInWorkJson)
                return parsed
            }),
            (err) => console.error(err)
        )
    }

    async updateWorkWeekComment(week: Week, comment?: string): Promise<WorkWeek> {
        return fetch(`/api/work/${week.year}/${week.week}`, {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: comment
        }).then(
            (r) => r.json(),
            (err) => console.error(err)
        )
    }

    private timeReplace(key: string, value: any) {
        if (value instanceof Time) {
            return value.toString().padStart(5, "0")
        }
        return value
    }

    async addOrUpdateWork(work: Work): Promise<Work> {
        return fetch(`/api/work`, {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify(work, this.timeReplace)
        }).then(
            (r) => r.json(),
            (err) => console.error(err)
        )
    }
}

export const Api = new ApiWrapper()

export default {}

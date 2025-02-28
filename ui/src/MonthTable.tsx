import { useState } from 'react'
import { Table } from "react-bootstrap";
import { Project, Time, WorkWeek } from "./Api";
import { Month } from "./MonthPicker";

interface SumOfTimePerProjectProps {
    projectFilter: (projectId: string) => boolean
    workWeeks?: WorkWeek[]
    month: Month
}

const SumOfTimePerProject = ({ projectFilter, workWeeks, month }: SumOfTimePerProjectProps) => {
    return <>
        {
            workWeeks?.flatMap(w => w.work).filter(
                w => new Date(w.date).getMonth() === month.getFirstDay().getMonth()
            ).filter(w => projectFilter(w.project))
                .map(
                    w => w.period.totalTime()
                ).reduce((a, b) => a.plus(b), new Time(0, 0)).toString()
        }
    </>
}

interface WeekRowProps {
    workWeek: WorkWeek
    projects?: Project[]
    activeWeeks: string[]
    toggleActiveWeek: (s: string) => void
    month: Month
}

const WeekRow = ({ workWeek, projects, activeWeeks, toggleActiveWeek, month }: WeekRowProps) => {
    return <>
        <tr onClick={() => toggleActiveWeek(workWeek.week)} className={(activeWeeks.includes(workWeek.week)) ? "table-success" : ""} key={workWeek.week}>
            <td key={workWeek.week}>{workWeek.week}</td>
            <td key="weekTotal"><SumOfTimePerProject projectFilter={(_: string) => true} workWeeks={[workWeek]} month={month} /></td>
            {projects?.map(p =>
                <td key={`${p.projectId}`}>
                    <SumOfTimePerProject projectFilter={(s: string) => s === p.projectId} workWeeks={[workWeek]} month={month} key={p.projectId} />
                </td>
            )}
        </tr>
        {Array.from(new Set(
            workWeek.work.map(w => w.date).filter(
                d => new Date(d).getMonth() === month.getFirstDay().getMonth()
            )
        )).sort().map(d => {
            return <tr hidden={!activeWeeks.includes(workWeek.week)} key={d} className="table-warning">
                <td key="d">{d}</td>
                <td key="dTotal">{workWeek.work.filter(w => w.date === d).map(w => w.period.totalTime()).reduce((a, b) => a.plus(b), new Time(0, 0)).toString()}</td>
                {
                    projects?.map(p =>
                        [p.projectId, workWeek.work.filter(
                            w => w.project === p.projectId && w.date === d
                        ).map(w => w.period.totalTime())
                            .reduce((a, b) => a.plus(b), new Time(0, 0)).toString()]
                    ).map(t => <td key={t[0]}>{t[1]}</td>)
                }
            </tr>
        })
        }
    </>

}

interface MonthTableProps {
    workWeeks?: WorkWeek[]
    projects?: Project[]
    month: Month
}

const MonthTable = ({ workWeeks, projects, month }: MonthTableProps) => {

    const [activeWeeks, setActiveWeeks] = useState<string[]>([])

    const toggleActiveWeek = (week: string) => {
        if (activeWeeks.includes(week)) {
            setActiveWeeks(activeWeeks.filter(w => w !== week))
        } else {
            setActiveWeeks([...activeWeeks, week])
        }
    }

    return <Table striped bordered>
        <thead>
            <tr>
                <td>Week/Day</td>
                <td>Total</td>
                {projects?.map(p => <th key={p.projectId}>{p.name}</th>)}
            </tr>
        </thead>
        <tbody>
            {
                workWeeks?.map(workWeek => <WeekRow key={workWeek.week} workWeek={workWeek} projects={projects} activeWeeks={activeWeeks} toggleActiveWeek={toggleActiveWeek} month={month} />)
            }
        </tbody>
        <tfoot className="table-group-divider">
            <tr className="table-info" key="footer">
                <td>Total</td>
                <td><SumOfTimePerProject projectFilter={(_: string) => true} workWeeks={workWeeks} month={month} /></td>
                {projects?.map(p => <td key={p.projectId}>
                    <SumOfTimePerProject projectFilter={(s: string) => s === p.projectId} workWeeks={workWeeks} month={month} key={p.projectId} />
                </td>)}
            </tr>
        </tfoot>
    </Table>
}

export default MonthTable

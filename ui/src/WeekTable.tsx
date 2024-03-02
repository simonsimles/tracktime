import { useState, useEffect } from 'react'
import { Table } from 'react-bootstrap'
import { WorkWeek, Project, Work, Time } from './Api'

interface WeekTableProps {
    workWeek?: WorkWeek
    projects: Project[]
}

interface WeekTableCellProps {
    workWeek?: WorkWeek
    date: Date,
    projectFilter: (w: Work) => boolean,
    dateOverride?: boolean
}

const WeekTableCell = ({ workWeek, date, projectFilter, dateOverride }: WeekTableCellProps) => {
    return <td>
        {workWeek?.work.filter(
            w => w.date === date.toISOString().substring(0, 10) || dateOverride
        ).filter(projectFilter).map(
            w => w.period.totalTime()).reduce(
                (p, n) => p.plus(n), new Time(0, 0)
            ).toString()}</td>
}

const WeekTable = ({ workWeek, projects }: WeekTableProps) => {
    const [projectMap, setProjectMap] = useState<[string, string][]>([])
    const [days, setDays] = useState<Date[]>([])

    useEffect(() => {
        setProjectMap(projects.sort((p, p2) => p.name.localeCompare(p2.name)).map(p => [p.projectId, p.name]))
    }, [projects])

    useEffect(() => {
        let d = workWeek?.work.map(w => w.date) ?? []
        d = d.filter((v, i) => d.indexOf(v) === i)
        d.sort()
        setDays(d.map(s => new Date(s)))
    }, [workWeek])

    function getProjectNameById(id: string): string {
        const filteredProject = projectMap.filter(p => p[0] === id)
        if (filteredProject.length > 0) {
            return filteredProject[0][1]
        }
        return ""
    }

    return <Table striped bordered hover>
        <thead>
            <tr>
                <th>Day</th>
                <th>Comments</th>
                <th>Total time</th>
                {projectMap.map(p => <th key={p[1]}>{p[1]}</th>)}
            </tr>
        </thead>
        <tbody>
            {days.map(d => <tr key={d.toISOString()}>
                <td>{d.toDateString()}</td>
                <td>{
                    workWeek?.work.filter(w => w.date === d.toISOString().substring(0, 10))
                        .filter(w => w.comment !== undefined).map((w, idx) =>
                            <code key={idx} className="border p-1 m-1">
                                {getProjectNameById(w.project)}:{w.comment}
                            </code>)
                }</td>
                <WeekTableCell workWeek={workWeek} date={d} projectFilter={_ => true} />
                {projectMap.map(p =>
                    <WeekTableCell key={p[0]} workWeek={workWeek} date={d}
                        projectFilter={(w: Work) => w.project === p[0]} />)}
            </tr>)}
        </tbody>
        <tfoot className='table-group-divider'>
            <tr className="table-info">
                <th>Total</th>
                <th />
                <th />
                {projectMap.map(p =>
                    <WeekTableCell key={p[0]} workWeek={workWeek} date={new Date()} dateOverride={true}
                        projectFilter={(w) => w.project === p[0]} />
                )}
            </tr>
        </tfoot>
    </Table>
}

export default WeekTable

import { useEffect, useState } from 'react';
import { Api } from './Api';
import MonthPicker, { Month } from './MonthPicker';
import { WorkWeek, Project } from './Api';
import { Container, Row } from 'react-bootstrap';
import MonthTable from './MonthTable';

interface MonthViewProps {
    month: Month
    setMonth: (month: Month) => void
}

const MonthView = ({ month, setMonth }: MonthViewProps) => {
    const [workWeeks, setWorkWeeks] = useState<WorkWeek[]>()
    const [projects, setProjects] = useState<Project[]>()

    useEffect(() => {
        Api.getProjects().then(projectList => {
            setProjects(
                projectList.filter(p => workWeeks?.flatMap(w => w.work).map(w => w.project).includes(p.projectId)).sort((a,b) => a.name.localeCompare(b.name))
            )
        })
    }, [workWeeks])

    useEffect(() => {
        setWorkWeeks([])

        const fetchWorkWeeks = async () => {
            const promises = month.getWeeks().map(w => Api.getWorkWeek(w))

            try {
                const results = await Promise.all(promises)
                const sortedAndFilteredResults = results.filter(Boolean).sort((u,v) => u.week.localeCompare(v.week))
                setWorkWeeks(sortedAndFilteredResults)
            } catch (error) {
                console.error(error)
            }
        }
        fetchWorkWeeks()
    }, [month])


    return <Container>
        <Row className='pt-3'>
            <MonthPicker month={month} setMonth={setMonth} />
        </Row>

        <Row className='pt-3'>
            <h2>Month Overview</h2>
            <MonthTable workWeeks={workWeeks} projects={projects} month={month} />
        </Row>

    </Container>
}

export default MonthView

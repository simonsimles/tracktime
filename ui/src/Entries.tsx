import { useEffect, useState } from 'react'
import { Card, Col, Container, Row } from "react-bootstrap"
import { BsArrowClockwise, BsCupFill, BsStopwatch, BsStopwatchFill } from 'react-icons/bs'
import { AbsolutePeriod, Api, IntervalPeriod, Project, Work } from "./Api"
import WeekPicker, { Week } from "./WeekPicker"
import { ChangeWork, NewWork } from './WorkEditor'

function compareWork(w1: Work, w2: Work): number {
    if (w1.date < w2.date) { return -1 }
    else if (w1.date === w2.date) {
        if (w1.id < w2.id) { return -1 }
        else if (w1.id === w2.id) { return 0 }
        else { return 1 }
    } else { return 1 }
}

const PeriodElement = ({period}: {period?: AbsolutePeriod | IntervalPeriod}) => {
        if (period === undefined) { return <></> }
        else if (period instanceof AbsolutePeriod) {
            return <Card className='mt-2'>
                <Card.Footer>
                    <Row><Col>&sum;</Col><Col>{period.totalTime().toString()}</Col></Row>
                </Card.Footer>
            </Card>
        }
        else if (period instanceof IntervalPeriod) {
            return <>
                <small>
                    <Card className='mt-2'>
                        <Card.Body className="no-pad">
                            <Row><Col><BsStopwatch /></Col><Col>{period.start.toString()}</Col></Row>
                            <Row><Col><BsStopwatchFill /></Col><Col>{period.end?.toString() ?? <span>&mdash;</span>}</Col></Row>
                            <Row><Col><BsCupFill /></Col><Col>{period.pause?.toString() ?? <span>&mdash;</span>}</Col></Row>
                        </Card.Body>
                        <Card.Footer>
                            <Row><Col>&sum;</Col><Col>{period.totalTime().toString()}</Col></Row>
                        </Card.Footer>
                    </Card>
                </small>
            </>
        }
        else {
            console.error("Could not create string: ", period)
            return <></>
        }
}

interface WorkRowProps {
    work: Work
    projectMap: Map<string, Project>
    updateWork: () => void
}

const WorkRow = ({ work, projectMap, updateWork }: WorkRowProps) => {
    const [showEditDialog, setShowEditDialog] = useState(false)

    const getProjectById = (s: string) => {
        const project = projectMap.get(s)
        if (project !== undefined) {
            return <span className={project.isChargeable ? "text-success" : "text-warning"}>
                {project.name}
            </span>
        }
    }

    return <>
        <Card onClick={() => setShowEditDialog(true)}>
            <Card.Body>
                <style type="text/css">
                    {`
                .no-pad {
                    padding: 0px;
                }`}
                </style>
                <Card.Title>{work.date}</Card.Title>
                <Card.Subtitle>{getProjectById(work.project)}</Card.Subtitle>
                <PeriodElement period={work.period}/>
                <div hidden={work.comment === undefined}>
                    <pre className='mb-0 pb-0'>{work.comment ?? ""}</pre>
                </div>
            </Card.Body>
        </Card>
        <ChangeWork originalWork={work}
            projectMap={projectMap}
            isVisible={showEditDialog}
            close={() => setShowEditDialog(false)}
            updateWork={updateWork} />
    </>
}

interface DayWorkRowProps {
    workListForDay: Work[]
    projectMap: Map<string, Project>
    updateWork: () => void

}

const DayWorkRow = ({ workListForDay, projectMap, updateWork }: DayWorkRowProps) => {
    return <Row xs={1} md={3} lg={4} xl={6} className="g-3 mt-1 border-bottom pb-3">
        {workListForDay.map(w => <Col key={w.id}>
            <WorkRow key={w.id} work={w} projectMap={projectMap} updateWork={updateWork} />
        </Col>)}
    </Row>
}

interface EntriesProps {
    week: Week
    setWeek: (w: Week) => void
}

const Entries = ({ week, setWeek }: EntriesProps) => {
    const [workList, setWorkList] = useState<Work[]>([])
    const [projects, setProjects] = useState<Map<string, Project>>(new Map())

    function updateWork() {
        Api.getWorkForWeek(week).then((w) => {
            w.sort(compareWork)
            w.forEach(i => {
                if (i.period instanceof AbsolutePeriod) { i.period.totalTime = AbsolutePeriod.prototype.totalTime }
                else { i.period.totalTime = IntervalPeriod.prototype.totalTime }
            })
            setWorkList(w)
        })
    }

    function updateProjects() {
        Api.getProjects().then((projects) => {
            const m = new Map<string, Project>()
            projects.forEach(p => m.set(p.projectId, p))
            setProjects(m)
        })
    }

    function update() {
        updateProjects()
        updateWork()
    }

    useEffect(updateWork, [week])

    useEffect(updateProjects, [])

    let days: string[] = workList.map(w => w.date).filter((v, i, all) => all.indexOf(v) === i)
    days.sort()

    return <Container>
        <div className="d-flex flex-row-reverse justify-content-right pt-3">
            <BsArrowClockwise onClick={update} />
        </div>
        <Row className='pt-3'>
            <WeekPicker week={week} setWeek={setWeek} />
        </Row>
        {days.map(d => <DayWorkRow key={d} projectMap={projects}
            updateWork={updateWork} workListForDay={workList.filter(w => w.date === d)} />)}
        <Row className='me-auto pt-3 justify-content-center'>
            <NewWork updateWork={updateWork}
                newId={workList.map(w => w.id).reduce((p, n) => p < n ? n : p, 0) + 1}
                week={week}
                projectMap={projects} />
        </Row>
    </Container>
}

export default Entries

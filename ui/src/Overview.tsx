import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { AbsolutePeriod, Api, IntervalPeriod, Project, Time, Work, WorkWeek } from './Api';
import WeekPicker, { Week } from './WeekPicker';
import WeekTable from './WeekTable';

interface WeekCommentProps {
    showControl: [boolean, (p: boolean) => void]
    comment: [string | undefined, (s: string | undefined) => void]
    week: Week
    saveComment: (week: Week, comment?: string) => void
}

const WeekCommentEditor = ({ showControl, comment, week, saveComment }: WeekCommentProps) => {
    return <Modal show={showControl[0]} onHide={() => showControl[1](false)}>
        <Modal.Header closeButton>
            <Modal.Title>Edit Week Comment for Week {week.toString()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group>
                <Form.Control as="textarea" rows={5}
                    value={comment[0]} onChange={e => comment[1](e.target.value)} />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={() => saveComment(week, comment[0])}>Save</Button>
            <Button variant="secondary" onClick={() => showControl[1](false)}>Close</Button>
        </Modal.Footer>
    </Modal>
}

interface SummaryRowProps {
    workWeek?: WorkWeek
    projects: Project[]
}

const SummaryRow = ({ workWeek, projects }: SummaryRowProps) => {
    const [projectToChargeable, setProjectToChargeable] = useState<Map<string, boolean>>(new Map())

    useEffect(() => {
        let m = new Map<string, boolean>()
        projects.forEach(p => m.set(p.projectId, p.isChargeable))
        setProjectToChargeable(m)
    }, [projects])

    function sumWork(filter: (w: Work) => boolean): Time {
        const filteredWork = workWeek?.work.filter(filter) ?? []
        return filteredWork.map(w => w.period.totalTime())
            .reduce((prev, curr) => curr.plus(prev), new Time(0, 0))
    }

    const days = new Set(workWeek?.work.map(w => w.date)).size

    const totalWork = sumWork(() => true)

    return <Card className={totalWork.hours >= 8 * days ? "text-bg-success" : "text-bg-warning"}>
        <Card.Title>Summary</Card.Title>
        <Row>
            <Col>Chargeable:</Col>
            <Col>{sumWork((w) => (projectToChargeable.get(w.project)) ?? false).toString()}</Col>
        </Row>
        <Row>
            <Col>Non-Chargeable:</Col>
            <Col>{sumWork((w) => !(projectToChargeable.get(w.project))).toString()}</Col>
        </Row>
        <Row className="mb-2">
            <Col><b>Total: </b></Col>
            <Col><b>{totalWork.toString()}</b></Col>
        </Row>
    </Card>
}

interface OverviewProps {
    week: Week
    setWeek: (week: Week) => void
}

const Overview = ({ week, setWeek }: OverviewProps) => {
    const [workWeek, setWorkWeek] = useState<WorkWeek>()
    const [projects, setProjects] = useState<Project[]>([])
    const showCommentEdit = useState(false)
    const commentEdit = useState<string>()

    function fixAndSetWorkWeek(ww: WorkWeek) {
        if (ww !== undefined) {
            ww.work.forEach(w => {
                if (w.period instanceof AbsolutePeriod) {
                    w.period.totalTime = AbsolutePeriod.prototype.totalTime
                } else {
                    w.period.totalTime = IntervalPeriod.prototype.totalTime
                }
            })
        }
        setWorkWeek(ww)
    }

    useEffect(() => {
        Api.getWorkWeek(week).then(
            (r) => fixAndSetWorkWeek(r),
            (err) => console.error(err))
    }, [week])

    useEffect(() => {
        Api.getProjects().then((p) => setProjects(p.filter(project => project.isActive)))
    }, [])

    function saveComment(week: Week, comment?: string) {
        Api.updateWorkWeekComment(week, comment).then(
            (r) => fixAndSetWorkWeek(r),
            (err) => console.error(err)
        )
        showCommentEdit[1](false)
    }

    return <Container>
        <Row className='pt-3'>
            <WeekPicker week={week} setWeek={setWeek} />
        </Row>

        <Row className="pt-3">
            <Card onClick={() => { commentEdit[1](workWeek?.comment); showCommentEdit[1](true) }}>
                <Card.Title>Week Comment</Card.Title>
                <Card.Text>{workWeek?.comment}</Card.Text>
            </Card>
            <WeekCommentEditor
                showControl={showCommentEdit} week={week}
                comment={commentEdit} saveComment={saveComment} />
        </Row>

        <Row className='pt-3'>
            <h2>Work</h2>
            <WeekTable projects={projects} workWeek={workWeek} />
        </Row>

        <Row className="pt-4">
            <SummaryRow workWeek={workWeek} projects={projects} />
        </Row>
    </Container>
}

export default Overview

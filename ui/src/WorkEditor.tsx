import { useEffect, useState } from 'react'
import { Button, Form, Offcanvas, Row } from 'react-bootstrap'
import { BsStopwatch } from 'react-icons/bs'
import { Api, AbsolutePeriod, getTimeFromString, IntervalPeriod, Project, Time, Work } from './Api'
import { Week } from './WeekPicker'

interface TimeFieldProps {
    time?: Time
    setTime: (t: Time) => void
}

const TimeField = ({ time, setTime }: TimeFieldProps) => {
    const [timeString, setTimeString] = useState(time?.toString() ?? "")

    useEffect(() => setTimeString(time?.toString() ?? ""), [time])

    const reportTime = (ts: string) => {
        setTimeString(ts)
        const parsed = getTimeFromString(ts)
        if (parsed) { setTime(parsed) }
    }

    return <Form.Control value={timeString}
        onChange={e => setTimeString(e.target.value)}
        isValid={getTimeFromString(timeString) !== undefined}
        onBlur={e => reportTime(e.target.value)}
    />
}

interface WorkEditorProps {
    work: Work
    setWork: (w: Work) => void
    projectMap: Map<string, Project>
}

export const WorkEditor = ({ work, setWork, projectMap }: WorkEditorProps) => {
    const projects: [string, string][] = []
    projectMap.forEach((v, k) => {
        if (v.isActive) {
            projects.push([k, v.name])
        }
    })

    const getWorkIntervalAsAbolutePeriod = () => new AbsolutePeriod(work.period.totalTime())
    const setProject = (id: string) => setWork(Object.assign({}, work, { project: id }))
    const setDate = (date: string) => setWork(Object.assign({}, work, { date: date }))
    const setAbsolutePeriod = (p: AbsolutePeriod) => setWork(Object.assign({}, work, { period: p }))
    const setIntervalPeriod = (p: IntervalPeriod) => setWork(Object.assign({}, work, { period: p }))
    const setComment = (comment: String) => setWork(Object.assign({}, work, { comment: comment.length > 0 ? comment : undefined }))
    return <Form>
        <Row>
            <Form.Group>
                <Form.Label>Id</Form.Label>
                <Form.Control disabled value={work.id} />
            </Form.Group>
        </Row>
        <Row>
            <Form.Group>
                <Form.Label>Project</Form.Label>
                <Form.Select onChange={e => setProject(e.target.selectedOptions[0].id)}>
                    {work.project === "" ? <option>Select a project</option> : <></>}
                    {projects.map(t =>
                        <option key={t[0]} id={t[0]} value={work.project}>{t[1]}</option>)}
                </Form.Select>
            </Form.Group>
        </Row>
        <Row>
            <Form.Group>
                <Form.Label>Day</Form.Label>
                <Form.Control type="date" value={work.date} onChange={e => setDate(e.target.value)}
                    max={new Week(work.date).getFriday().toISOString().substring(0, 10)}
                    min={new Week(work.date).getMonday().toISOString().substring(0, 10)} />
            </Form.Group>
        </Row>
        <Row className='pt-2'>
            <Form.Group>
                <Form.Check inline label="Absolute Period" type="radio" name="period" checked={work.period instanceof AbsolutePeriod} onChange={() => setAbsolutePeriod(getWorkIntervalAsAbolutePeriod())} />
                <Form.Check inline label="Interval Period" type="radio" name="period" checked={work.period instanceof IntervalPeriod}
                    onChange={() => setIntervalPeriod(new IntervalPeriod(new Time().now()))} />
            </Form.Group>
        </Row>
        {work.period instanceof AbsolutePeriod ?
            <Row>
                <Form.Group>
                    <Form.Label>Time</Form.Label>
                    <TimeField time={work.period.time}
                        setTime={t => setAbsolutePeriod(new AbsolutePeriod(t))} />
                </Form.Group>
            </Row> :
            <>
                <Row>
                    <Form.Group>
                        <Form.Label>Start</Form.Label>
                        <TimeField time={work.period.start}
                            setTime={t => setIntervalPeriod(
                                new IntervalPeriod(t, (work.period as IntervalPeriod).end, (work.period as IntervalPeriod).pause)
                            )} />
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group>
                        <Form.Label>End <BsStopwatch onClick={() => setIntervalPeriod(
                            new IntervalPeriod(
                                (work.period as IntervalPeriod).start,
                                new Time().now(),
                                (work.period as IntervalPeriod).pause)
                        )} /></Form.Label>
                        <TimeField time={work.period.end}
                            setTime={t => setIntervalPeriod(
                                new IntervalPeriod((work.period as IntervalPeriod).start, t, (work.period as IntervalPeriod).pause))} />
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group>
                        <Form.Label>Pause</Form.Label>
                        <TimeField time={work.period.pause}
                            setTime={t => setIntervalPeriod(
                                new IntervalPeriod((work.period as IntervalPeriod).start, (work.period as IntervalPeriod).end, t)
                            )} />
                    </Form.Group>
                </Row>
            </>
        }
        <p>Total time: {work.period.totalTime().toString()}</p>

        <Form.Group>
            <Form.Label>Comment</Form.Label>
            <Form.Control type="textarea" value={work.comment ?? ""} onChange={e => setComment(e.target.value)} />
        </Form.Group>
    </Form>
}

interface ChangeWorkProps {
    close: () => void
    originalWork: Work
    projectMap: Map<string, Project>
    isVisible: boolean
    updateWork: () => void
}

export const ChangeWork = ({ close, originalWork, projectMap, isVisible, updateWork }: ChangeWorkProps) => {
    const [work, setWork] = useState<Work>(Object.assign({}, originalWork))

    const save = () => {
        Api.addOrUpdateWork(work).then(
            () => updateWork(),
            (err) => console.error(err))
        close()
    }

    return <>
        <Offcanvas show={isVisible} onHide={close} placement={"end"}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Record new work</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <WorkEditor work={work} setWork={setWork} projectMap={projectMap} />

                <div className='d-grid gap-2 pt-4'>
                    <Button onClick={save}>Save</Button>
                    <Button variant="secondary" onClick={close}>Cancel</Button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    </>
}

interface NewWorkProps {
    updateWork: () => void
    newId: number
    week: Week
    projectMap: Map<string, Project>
}

export const NewWork = ({ updateWork, newId, week, projectMap }: NewWorkProps) => {
    const [isVisible, setIsVisible] = useState(false)
    const [work, setWork] = useState<Work>({} as Work)

    const close = () => setIsVisible(false)
    const open = () => {
        setWork({
            id: newId,
            project: "",
            date: week.getClosestToCurrentDate().toISOString().substring(0, 10),
            period: new IntervalPeriod(new Time().now())
        })
        setIsVisible(true)
    }

    const isValid = () => {
        return projectMap.has(work.project) &&
            work.period !== undefined
    }

    const save = () => {
        Api.addOrUpdateWork(work).then(
            _ => {
                close()
                updateWork()
            })
    }

    return <>
        <Offcanvas show={isVisible} onHide={close} placement={"end"}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Record new work</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <WorkEditor work={work} setWork={setWork} projectMap={projectMap} />

                <div className='d-grid gap-2 pt-4'>
                    <Button onClick={save} disabled={!isValid()}>Save</Button>
                    <Button variant="secondary" onClick={close}>Cancel</Button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
        <Row>
            <Button onClick={open}>Record new work</Button>
        </Row>
    </>
}

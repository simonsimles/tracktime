import { JobNumber } from "./Api"
import { Row, Col, ListGroup, Form } from "react-bootstrap"
import { BsFillPlusCircleFill, BsFillDashCircleFill } from 'react-icons/bs';


interface JobNumbersProps {
    jobNumbers: JobNumber[]
    updateJobNumbers: (jobNumbers: JobNumber[]) => void
}

export const JobNumberList = ({ jobNumbers, updateJobNumbers }: JobNumbersProps) => {
    function newJobNumber() {
        const j: JobNumber = {
            jobNumber: `ABC${Math.floor(Math.random() * 1000)}`
        }
        updateJobNumbers([...jobNumbers, j])
    }

    function removeJobNumber(jn: string) {
        updateJobNumbers(jobNumbers.filter(j => j.jobNumber !== jn))
    }

    function isValid(s: string): boolean {
        return jobNumbers.map(j => j.jobNumber).filter(j => j === s).length === 1
    }

    function datesOk(start?: string, end?: string) {
        if (end == null) { return start?.match("\\d{4}-\\d{2}-\\d{2}") !== null }
        if (start == null) { return false }
        return (start <= end)
    }

    function updateJobNumber(oldJobNumber: string, newJobNumber: string, startDate?: string, endDate?: string) {
        updateJobNumbers(jobNumbers.map((jn: JobNumber) => {
            switch (jn.jobNumber) {
                case oldJobNumber: return { jobNumber: newJobNumber, startDate: startDate, endDate: endDate }
                default: return jn
            }
        }))
    }


    return <>
        <Row className='p-2'>
            <Col md="auto">
                <div>Job numbers</div>
            </Col>
            <Col>
                <BsFillPlusCircleFill onClick={newJobNumber} />
            </Col>
        </Row>
        <ListGroup>
            {jobNumbers.map((jn, idx) => {
                return <ListGroup.Item key={idx}>
                    <Row>
                        <Col>
                            <Form.Control
                                type="text"
                                value={jn.jobNumber}
                                isValid={isValid(jn.jobNumber)}
                                onChange={e => updateJobNumber(jn.jobNumber, e.target.value, jn.startDate, jn.endDate)} />
                        </Col>
                        <Col>
                            <Form.Control
                                type="date"
                                value={jn.startDate}
                                isValid={datesOk(jn.startDate, jn.endDate)}
                                onChange={e => updateJobNumber(jn.jobNumber, jn.jobNumber, e.target.value, jn.endDate)} />
                        </Col>
                        <Col>
                            <Form.Control
                                type="date"
                                value={jn.endDate}
                                isValid={datesOk(jn.startDate, jn.endDate)}
                                onChange={e => updateJobNumber(jn.jobNumber, jn.jobNumber, jn.startDate, e.target.value)} />
                        </Col>
                        <Col md="auto"><BsFillDashCircleFill onClick={() => removeJobNumber(jn.jobNumber)} /></Col>
                    </Row>
                </ListGroup.Item>
            })}
        </ListGroup>
    </>
}


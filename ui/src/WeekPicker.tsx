import { Container, Form } from 'react-bootstrap';
import { DAY_IN_SECONDS, getWeekFromDate } from './Date';


export class Week {
    year: number
    week: number

    constructor(weekString: string);
    constructor(year: number, week: number);
    constructor(value1: string | number, value2?: number) {
        if (typeof value1 == "string") {
            const weekString = value1
            const matches = weekString.match("(\\d{4})-W(\\d{2})")
            if (matches) {
                this.year = Number(matches[1])
                this.week = Number(matches[2])
            } else {
                const matches = weekString.match("(\\d{4})-(\\d{2})-(\\d{2})")
                let d: Date
                if (matches) {
                    d = new Date(Number(matches[1]), Number(matches[2]) - 1, Number(matches[3]))
                } else {
                    d = new Date()
                }
                this.year = d.getFullYear()
                this.week = getWeekFromDate(d)
            }
        } else if (typeof value1 == "number" && typeof value2 == "number") {
            this.year = value1
            this.week = value2
        } else {
            throw new Error("Invalid arguments to Week")
        }
    }

    toString() { return `${this.year}`.padStart(4, "0") + "-W" + `${this.week}`.padStart(2, "0") }

    getThursday(): Date {
        const newYear = new Date(this.year, 0, 1, 12)
        const firstThursday =
            newYear.getDay() > 4 ?
                new Date(
                    Number(newYear)
                    + DAY_IN_SECONDS * (7 - (newYear.getDay() % 4))) :
                new Date(
                    Number(newYear)
                    + DAY_IN_SECONDS * (4 - newYear.getDay()))
        return new Date(
            Number(firstThursday)
            + (this.week - 1) * 7 * DAY_IN_SECONDS)
    }

    getMonday(): Date {
        return new Date(Number(this.getThursday()) - DAY_IN_SECONDS * 3)
    }

    getFriday(): Date {
        return new Date(Number(this.getThursday()) + DAY_IN_SECONDS)
    }

    getClosestToCurrentDate(): Date {
        const today = new Date()
        const monday = this.getMonday()
        if (today < monday) { return monday }
        const friday = this.getFriday()
        return today < friday ? today : friday
    }
}

interface WeekPickerProps {
    week: Week
    setWeek: (week: Week) => void
}

const WeekPicker = ({ week, setWeek }: WeekPickerProps) => {
    return <Container>
        <Form>
            <Form.Group>
                <Form.Label>Select Week</Form.Label>
                <Form.Control type="week" value={week.toString()} onChange={e => setWeek(new Week(e.target.value))} />
            </Form.Group>
        </Form>
    </Container>
}

export default WeekPicker

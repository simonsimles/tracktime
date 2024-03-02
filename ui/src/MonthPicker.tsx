import { Container, Form } from 'react-bootstrap';
import { Week } from './WeekPicker';
import { getWeekFromDate } from './Date';

export class Month {
    year: number
    month: number

    constructor(monthString: string);
    constructor(year: number, month: number);
    constructor(value1: string | number, value2?: number){
        if (typeof value1 == "string") {
            const monthString = value1
            const matches = monthString.match("(\\d{4})-(\\d{2}).*")
            if (matches) {
                this.year = Number(matches[1])
                this.month = Number(matches[2])
            } else {
                const d = new Date()
                this.year = d.getFullYear()
                this.month = d.getMonth()
            }
        } else if (typeof value1 == "number" && typeof value2 == "number") {
            this.year = value1
            this.month = value2
        } else {
            throw new Error("illegal arguments")
        }
    }

    toString() { return `${this.year}`.padStart(4, "0") + "-" + `${this.month}`.padStart(2, "0") }

    getFirstDay(): Date { return new Date(this.year, this.month - 1, 1) }

    getLastDay(): Date { return new Date(this.year, this.month, 0) }

    getWeeks(): Array<Week> {
        const firstDay = this.getFirstDay()
        const lastDay = this.getLastDay()
        const firstWeek = getWeekFromDate(firstDay)
        const lastWeek = getWeekFromDate(lastDay)
        return Array.from({ length: lastWeek - firstWeek + 1 }, (_, i) => {
            return new Week(firstDay.getFullYear(), firstWeek + i)
        })
    }
}

interface MonthPickerProps {
    month: Month
    setMonth: (month: Month) => void
}

const MonthPicker = ({ month, setMonth }: MonthPickerProps) => {
    return <Container>
        <Form>
            <Form.Group>
                <Form.Label>Select Month</Form.Label>
                <Form.Control type="month" value={month.toString()} onChange={e => setMonth(new Month(e.target.value))} />
            </Form.Group>
        </Form>
    </Container>
}

export default MonthPicker;

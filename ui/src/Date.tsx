export const getWeekFromDate = function(d: Date) {
    const endDate: number = Number(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 4 - (d.getDay() || 7)))
    const startDate: number = Number(new Date(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((endDate - startDate) / (DAY_IN_SECONDS)) / 7)
}

export const DAY_IN_SECONDS = 24 * 60 *60 *1000

export { }

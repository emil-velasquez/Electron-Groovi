const useTime = () => {
    /**
     * Given a number of seconds (in either number of string form), calculate the HH:MM:SS equivalent
     * as a string and return that
     */
    const secondToHourMinuteSecond = (seconds: number | string) => {
        const TIME_SEP = ":";

        if (typeof seconds === "string") {
            seconds = Number(seconds);
        }

        seconds = Math.round(seconds);

        let minutes = seconds % 3600;
        const hours = (seconds - minutes) / 3600;
        let secs = minutes % 60;
        minutes = (minutes - secs) / 60;

        let time = "";
        if (hours !== 0) {
            time += hours.toString() + TIME_SEP;
        }
        time += minutes.toString() + TIME_SEP;
        if (secs < 10) {
            time += "0";
        }
        time += secs.toString();
        return { hours: hours, minutes: minutes, seconds: secs, time: time };
    }

    return secondToHourMinuteSecond;
}

export default useTime;
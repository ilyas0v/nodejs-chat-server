import * as moment from 'moment';

export const getCurrentTime = () => {
    return (moment(new Date())).format('HH:mm')
}
import * as moment from 'moment';

/**
 * 
 * @returns {string} - Method return current time in HH:mm format
 */
export const getCurrentTime = () => {
    return (moment(new Date())).format('HH:mm')
}
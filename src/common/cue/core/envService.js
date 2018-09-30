import objectUtil from '../util/objectUtil';
import dateUtil from '../util/dateUtil';

export default {
    getVarValue(varName, env) {
        if (objectUtil.isString(varName) && varName && varName[0] === '$') {
            if (varName === '$currentTime') {
                return new Date();
            } else if (varName === '$currentDate') {
                return dateUtil.getDateStart(new Date());
            } else if (env && env[varName] !== undefined) {
                return env[varName];
            } else {
                return varName;
            }
        }
    }
};

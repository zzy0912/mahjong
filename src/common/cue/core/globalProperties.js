import objectUtil from '../util/objectUtil';

let enableResource = document.getElementsByTagName('meta')['enableResource'] ? document.getElementsByTagName('meta')['enableResource'].content : '';
let _properties = {
    // enableResource: true
    enableResource: (enableResource === true) || (enableResource === 'true')
};

export default {
    set: function(key, value) {
        objectUtil.setFieldValue(_properties, key, value);
    },

    get: function(key) {
        return objectUtil.getFieldValue(_properties, key);
    }
};

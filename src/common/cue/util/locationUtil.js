export default {
    getSearch: function(key) {
        let query = window.location.search.substr(1);
        if (!query) {
            return null;
        } else {
            let queryObj = {};
            let arr = query.split('&');
            for (let i = 0; i < arr.length; i++) {
                let key_value = arr[i].split('=');
                queryObj[key_value[0]] = key_value[1];
            }
            return key ? queryObj[key] : queryObj;
        }
    }
};

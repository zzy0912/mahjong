/**
 * Created by MyPC on 2017/6/13.
 */

export default {
    call: function(service, method, para) {
        service; method; para;
/*        if (service === 'model') {
            if (method === 'getEntity') {
                if (para.target === 'program') {
                    return null;
                }
            }
        }*/
/*
        if (service === 'model') {
            if (method === 'getEntity') {
                if (para.id && para.id <= 0) {
                    return { };
                } else {
                    return {
                        id: 1,
                        sn: 'CL-01',
                        label: '教室1',
                        canBorrow: true,
                        belong: {id: 4, label: 'option1.2'},
                        address: 'jiefang road'
                    };
                }
            } else if (method === 'getEntities') {
                if (para.target === 'asset') {
                    return {
                        totalCount: 25, list: [
                            {
                                id: 1,
                                sn: 'CL-01',
                                label: '教室1',
                                canBorrow: true,
                                belong: {id: 1, label: 'option1'},
                                address: 'jiefang road'
                            },
                            {
                                id: 2,
                                sn: 'CL-02',
                                label: '教室2',
                                canBorrow: false,
                                belong: {id: 2, label: 'option2'},
                                address: 'yanan road'
                            }
                        ]
                    };
                } else {
                    return {
                        list: [
                            {
                                id: 1,
                                label: 'option1',
                                children: [{id: 3, label: 'option1.1'}, {id: 4, label: 'option1.2'}]
                            },
                            {
                                id: 2,
                                label: 'option2',
                                children: [{id: 5, label: 'option2.1'}, {id: 6, label: 'option2.2'}]
                            }
                        ], totalCount: 2
                    };
                }
            } else if (method === 'getEntityTree') {
                if (para.nodes[1].type === 'terminal_belong_item') {
                    return {
                        list: [
                            {
                                id: 1,
                                label: '教一',
                                children: [
                                    { id: 3, label: '一楼' },
                                    { id: 4, label: '二楼' },
                                    { id: 5, label: '三楼' }
                                ]
                            },
                            {
                                id: 2,
                                label: '教二',
                                children: [
                                    { id: 6, label: '一楼' },
                                    { id: 7, label: '二楼' }
                                ]
                            }
                        ], totalCount: 2
                    };
                } else {
                    return {
                        list: [
                            {
                                id: 1,
                                label: '校园风采',
                                children: [
                                    { id: 3, label: '校园风采1' },
                                    { id: 4, label: '校园风采2' },
                                    { id: 5, label: '校园风采3' }
                                ]
                            },
                            {
                                id: 2,
                                label: '教学指南',
                                children: [
                                    { id: 6, label: '教学指南1' },
                                    { id: 7, label: '教学指南2' }
                                ]
                            }
                        ], totalCount: 2
                    };
                }
            } else if (method === 'updateEntity') {
                return { id: 5 };
            } else if (method === 'deleteEntity') {
                return { };
            }
        }*/
        return undefined;
    },

    batchCall: function(calls) {
        var results = [ ];
        for (var i = 0; i < calls.length; i++) {
            var call = calls[i];
            results.push(this.call(call.service, call.method, call.para));
        }
        return results;
    }
};

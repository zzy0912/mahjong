<template>
  <el-date-picker
    v-model="times"
    type="daterange"
    align="right"
    unlink-panels
    range-separator="至"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    :picker-options="pickerOptions"
    @change="changeTime">
    </el-date-picker>
</template>
<script>
export default {
    name: 'user-date',
    data() {
        return {
            pickerOptions: {
				shortcuts: [{
					text: '最近一周',
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: '最近一个月',
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: '最近三个月',
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
						picker.$emit('pick', [start, end]);
					}
				}],
                disabledDate(time) {
                    return time.getTime() > Date.now();
                }
			},
			times: ''
        };
    },
    methods: {
		changeTime: function() {
			var date = '';
			if (this.times) {
				let endDate = new Date(this.times[1]);
				endDate.setDate(endDate.getDate() + 1);
				date = [this.times[0], endDate];
			}
            this.$emit('change', date);
        }
    }
};
</script>

<style>
</style>

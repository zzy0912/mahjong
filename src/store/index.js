import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
	pageTotal: 0,
  	showWidth: 220
};

const mutations = {
//	inc: state => state.count++,
//    dec: state => state.count--,
	handleShowMenu: state => {
		if (state.showWidth === 220) {
			state.showWidth = 0;
		} else {
			state.showWidth = 220;
		}
	}
//    add(state,n){
//      state.count+=n;
//      state.count1 += 1;
//    },
//    reduce(state){  //step1 needed
//      state.count-=1;
//      state.count1 -= 1;
//    }
}

const actions ={
	handleShowMenu: ({commit}) => commit('handleShowMenu')
//  reduce:({commit}) => commit('reduce'),
//  addAction(context){
//            //注意这里对reduce 进行了一次操作，会额外引发getters操作+100
//            setTimeout(()=>{context.commit('reduce')},3000);  
//            console.log('我比reduce提前执行');
//            context.commit('add',10)
//        },
//  reduceAction({commit}){
//            commit('reduce')
//        }
}

const getters={    //对count的属性进行操作，只要count有任何变化，结果都会+100
//    count:function(state){
//         return state.count +=100;
//    }
}

const store = new Vuex.Store({
    state,
	mutations,
	getters,
	actions
})

export default store
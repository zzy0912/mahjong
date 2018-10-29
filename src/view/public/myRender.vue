<template>
  <div ref='renderContent'>

  </div>
</template>

<script>
export default {
    props:{
        row: Object,
        render:Function
    },
    mounted(){
        this.$refs.renderContent.innerHTML = this.render()
    }
}
</script>

<style>

</style>
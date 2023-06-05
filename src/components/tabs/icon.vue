<template>
    <img class="img" :src="require('../../assets/img/' + type + '.png')" alt="">
</template>
<script>
export default {
    // catalog schema table column
    props: {
        type: String
    },
}
</script>
<style scoped >
.img {
    display: inline-block;
    font-size: 0;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    margin-right: 3px;
}
</style>
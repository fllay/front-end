<template>
  <b-modal
      id="inference"
      centered
      size="md"
      title="TEST"
      modal-class="my-modal-class"
      :hide-footer="true"
      @close="onClose"
      @hide="onClose"
    >
      <div class="display-screen">
        <ContinueMfccCapture ref="capture" @onImage="onImageReady"></ContinueMfccCapture>
      </div>
      <div class="infer-class">
        <img class="tag" src="~/assets/images/UI/svg/Group 177_green.svg" height="24" />
        <span>{{result}} [{{(this.prob * 100).toFixed(2)}}%]</span>
      </div>
      <div class="infer_control">
        <b-avatar button @click="onInfer" variant="primary" :icon="terminated? 'play-fill':'stop-fill'" class="align-baseline"></b-avatar>
      </div>
    </b-modal>
</template>
<script>
import axios from 'axios';
import { mapState, mapActions, mapMutations , mapGetters } from 'vuex';
import ContinueMfccCapture from '~/components/InputConnection/ContinueMfccCapture.vue';
export default {
  name : "InferenceModal",
  components:{
    ContinueMfccCapture
  },
  data(){
    return {
      terminated : true,
      result: "-",
      prob: 0
    }
  },
  computed: {
    ...mapState("server",["url","isConnected","isTraining","isTerminating","isTrained"]),
    ...mapState("project",["project"]),
  },
  methods:{
    doInference: async function(){
      if(this.terminated){
        return;
      }
      await this.$refs.capture.record();
    },
    onImageReady : async function(image){
      const formData = new FormData();
      formData.append("image", image, "infer.jpg");
      let project_id = this.project.id;
      formData.append("project_id", project_id);
      formData.append("type", "classification");
      try{
        let res = await axios({
          method: "POST",
          url: this.url + "/inference_image",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          }
        });
        if(res.data.result == "OK"){
          this.result = res.data.prediction;
          this.prob = res.data.prob;
        }
      }catch(err){
        console.log(err);
        return;
      }
    },
    onInfer: async function(){
      this.terminated = !this.terminated;
      console.log("terminated : ", this.terminated);
      if(!this.terminated){
        await this.doInference();
      }else{
        this.$refs.capture.endRecord();
      }
    },
    onClose: async function(){
      this.terminated = true;
      this.cameraReady = false;
      this.$refs.capture.stopListening();
      this.$refs.capture.endRecord();
    },
    sleep: function(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
}
</script>
<style lang="scss" scoped>
  .display-screen {
    background-color: #fff;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #000;
    margin-top: 10px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  .infer-class {
    padding: 10px;
    img {
      margin-right: 0.5em;
    }
    span {
      font-weight: 600;
    }
  }
  .infer_control{
    text-align: center;
  }
</style>
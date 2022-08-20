<template>
  <b-modal
      id="open-project-modal"
      title="เปิดโปรเจค"
      @show="fetchProject"
      @hidden="clearForm"
      @ok="openProjectHandle"
      :ok-disabled="!projectState"
    >
      <div v-if="currentDevice == 'ROBOT'">
        <form @submit.stop.prevent="">
          <b-form-group label="Project type">
            <b-form-select
              id="project-type"
              v-model="selectType"
              :options="models"
              required
            ></b-form-select>
          </b-form-group>
        </form>
        <p class="p-notice-color small">* เลือกโปรเจคที่ต้องการเปิด</p>
        <b-form-select
          id="project-id"
          v-model="projectToOpen"
          :options="projectByType"
          required
        ></b-form-select>
      </div>
      <div v-else-if="currentDevice == 'BROWSER' && step == 1">
        <b-row class="mb-4">
          <b-col>
            <b-form-file
              v-model="files"
              placeholder="เลือกโฟลเดอร์ของโปรเจค"
              drop-placeholder="ลากโฟลเดอร์ของโปรเจคมาวางที่นี่..."
              multiple
              directory
            >
            </b-form-file>
          </b-col>
        </b-row>
        <p class="p-notice-color small">* เลือกโฟลเดอร์ของโปรเจคที่ต้องการเปิด</p>
      </div>
      <div v-if="step >= 2" class="text-center">
        <vm-progress
              type="circle"
              :percentage="percentage"
              style="vertical-align: middle"
              strokeColor="#007E4E"
              stroke-width="24"
              :width="200"
        >
          <h4 v-if="step == 2" class="my-3" text-black>กำลังนำเข้า ... {{progress}}/{{files.length || ""}}</h4>
          <h4 v-else-if="step == 3" class="my-3" text-black>นำเข้าสำเร็จ</h4>
          <!-- <h4 class="my-3" text-black>กำลังบันทึก ... {{progress.toFixed(2)}}%</h4> -->
        </vm-progress>
      </div>
    </b-modal>
</template>
<script>
import { mapState, mapActions, mapMutations  } from 'vuex';
export default {
  data(){
    return {
      models: [
        { text: 'เลือกประเภทการเรียนรู้ (Select training type)', value: null },
        ...this.$extensions.map((el) => ({text : el.title, value : el.id}))
      ],
      selectType : null,
      projectList : [],
      projectToOpen : null,
      files : null,
      step: 1, //1= select folder , 2 = importing, 3 = import success
      progress : 0,
      percentage : 0,
    };
  },
  created(){
  },
  computed: {
    ...mapState(["currentDevice","isSaving","isOpening"]),
    projectState() {
      if(this.currentDevice == "BROWSER"){
        return (this.step >= 3 || this.step == 1) && this.files && this.files.length > 0;
      }else if(this.currentDevice == "ROBOT"){
        return (this.step >= 3 || this.step == 1) && this.projectToOpen;
      }
    },
    projectByType(){
      let filtered = this.projectList.filter(el=>el.projectType==this.selectType);
      if(filtered.length > 0){
        return filtered.map(el=>({text:el.name, value: el.id}));
      }else{
        this.projectToOpen = null;
        return null;
      }
    }
  },
  methods : {
    ...mapMutations("project",["setProject"]),
    ...mapActions("dataset",["addFileToFs","clearDataset","restoreDataset"]),
    ...mapActions("project",["fetchProjects"]),
    clearForm(){
      this.selectType = null;
      this.projectToOpen = null;
      this.projectList = [];

      this.files = [];
      this.step = 1;
      this.progress = 0;
    },
    async fetchProject(){
      if(this.currentDevice == "ROBOT"){
        this.projectList = await this.fetchProjects();
      }
    },
    async openProjectHandle(e){
      if(this.step == 1){ //selecting file
        e.preventDefault();
        this.step = 2;
        this.progress = 0;
        let projectFile = this.files.find(el=>el.name == "project.json");
        if(!projectFile){
          this.step = 1;
          this.$toast.error("Folder ที่เลือกไม่พบโปรเจคไฟล์");
          return false;
        }
        // parse project file
        let files = this.files.filter(el=>el.name != projectFile.name);
        let projectJsonText = await this.$helper.readFile(projectFile);
        let projectJson = JSON.parse(projectJsonText);
        let projectId = projectJson.project.project.id;
        await this.clearDataset(); //clear old dataset file
        console.log("cleared");
        for(let file of files){
          this.progress+=1;
          this.percentage= Math.round(this.progress/files.length*100);
          await this.addFileToFs({projectId : projectId, file : file});
        }
        this.restoreDataset(projectJson.dataset.dataset);
        this.setProject(projectJson.project.project); //assign new dataset
        this.step = 3;
        this.$toast.success("เปิดโปรเจคและนำเข้าเสร็จเรียบร้อย");
      }else if(this.step == 3){
        //import success 
      }
    },
    async openLocalProject(){
      if(this.step == 1){ //selecting file
        e.preventDefault();

      }else if(this.step == 3){
        //import success 
      }
    },
    async delay(time){
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          resolve();
        },time);
      });
    },
  }
}
</script>
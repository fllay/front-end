<template>
  <div class="blockly-module">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel">
        <div class="d-flex flex-fill flex-column" style="background-color: white">
          <blockly-code ref="blockly"></blockly-code>
        </div>
        <div style="height: 200px; display: flex;">
          <div style="width: 100%; height: 100%; padding: 5px; background-color: black;" id="terminal" ref="terminal"></div>
          <div style="width: 200px; height: 100%;text-align: center;padding-top: 46px; background-color: black;">
            <div class="button">
              <button
                pill
                v-on:click="handleRun"
                class="btn-run op-btn"
              >
                <span class="ico">
                  <img v-if="!isRunning" src="~/assets/images/UI/svg/Group 80.svg" alt="" srcset=""/>
                  <img v-else src="~/assets/images/UI/svg/Group 82.svg" alt="" srcset=""/>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import io from "socket.io-client";

import "xterm/css/xterm.css";
import BlocklyCode from "@/components/BlocklyCode.vue";

import { mapState, mapActions, mapMutations , mapGetters } from "vuex";
export default {
  name: "BlocklyComponent",
  components: {
    BlocklyCode
  },
  data() {
    return {
      isRunning : false,
      logs: "",
      s_result: "",
      term: null,
      socket : null
    };
  },
  methods: {
    async handleRun(){

    },
    async run(){
      let code = blocklyPython.workspaceToCode(this.blockly_woakspace);
      console.log(code);
      this.$toast.success("Running code");
    },
  },
  computed: {
    ...mapState(["currentDevice","serverUrl","tarminalUrl","streamUrl"]),
  },
  watch: {
    
  },
  mounted() {
    this.term = new Terminal({ cursorBlink: true });        
    const fitAddon = new FitAddon();
    this.term.loadAddon(fitAddon);
    this.term.open(this.$refs.terminal);
    this.term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    fitAddon.fit();
    this.socket = io(this.tarminalUrl); //.connect();
    this.socket.on('connect', function() {
      this.term.write('\r\n*** Connected to backend ***\r\n');
    });
    this.term.onKey(function (ev) {
      this.socket.emit('data', ev.key);
    });
    this.socket.on('data', function(data) {
      this.term.write(data);
    });
    this.socket.on('disconnect', function() {
      this.term.write('\r\n*** Disconnected from backend ***\r\n');
    });
  },
  created() {
    
  },
  beforeDestroy() {
    //this.unsubscribe();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style lang="scss" scoped>
$primary-color: #007e4e;
$black: #333;
$yellow: #fff7d6;
$grey: #eeeeee;

* {
  margin: 0;
  padding: 0;
  outline: none;
  box-sizing: border-box;
}

ul {
  list-style: none;
  padding: 0;
}
.button{
  .btn-run {
    img {
      width: 100px;
    }
  }

  .btn-stop {
    img {
      width: 100px;
    }
  }
}

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

.main-panel {
  width: calc(100% - 300px);
}

.blockly-module {
  display: flex;
  position: relative;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;

  .blockly {
    height: 100%;
    width: 100%;
  }
  
  
  .side-panel {
    padding: 15px;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 300px;
    text-align: end;

    .btn-run {
      img {
        width: 100px;
      }
    }

    .btn-stop {
      img {
        width: 100px;
      }
    }

    .display-panel {
      border-radius: 8px;
      background-color: #333;
      overflow: hidden;
      border: #adb5bd solid 1px;

      .display-image {
        img {
          min-height: 180px;
          height: 180px;
          width: 100%;
          object-fit: cover;
        }
      }

      .control {
        background-color: #ffffff;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        text-transform: uppercase;

        .check {
          padding-left: 36px;
          font-size: 0.7rem;
          color: #222222;
          display: flex;
          align-items: center;
        }
      }
    }

    .next {
      height: 50px;
      background: #ffffff 0% 0% no-repeat padding-box;
      border-radius: 38px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      margin-top: 15px;

      span {
        color: $primary-color;
        font-size: 1.5rem;
        font-weight: 800;

        &.ico {
          position: absolute;
          top: 7px;
          right: 18px;
        }
      }
    }
  }
}
#expanded-camera {
  .result {
    height: 20vh;
    .bg-secondary {
      height: 100%;
    }
  }
  .display-image {
    background-color: #333 !important;
    img.realtime-image {
      width: 100%;
      height: 55vh;
      object-fit: contain;
    }
  }
  .control {
    background-color: #ffffff;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    text-transform: uppercase;

    .check {
      padding-left: 36px;
      font-size: 0.7rem;
      color: #222222;
      display: flex;
      align-items: center;
    }
  }
}
</style>
<style lang="scss" scoped>
button {
  color: unset;
  border: unset;
  background-color: unset;
  text-align: left;
  position: relative;

  &::after {
    position: absolute;
    top: 17px;
    right: 15px;
  }
}

.custom-control-label::before {
  top: 0 !important;
}

.custom-control-label::after {
  top: 2px !important;
}

.custom-control-input:checked ~ .custom-control-label::before {
  color: #333;
  border-color: #333;
  background-color: #333;
}

.train-pgr {
  border: none !important;
}

.scroll-box {
  height: 200px;
  overflow-y: scroll;
  text-align: left;
  padding: 20px !important;
  background-color: #333 !important;
  display: flex;
  flex-direction: column-reverse;
}

//.modal-footer {
//    display: none !important;
//}
</style>

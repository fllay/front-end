export default (Blockly, that) => {
  // ========== classification process ========== //
  Blockly.Blocks["tfjs_yolo_init_model"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Initial model with")
        .appendField("IoU threshold")
        .appendField(new Blockly.FieldNumber(0.5, 0.1, 0.99), "iot_threshold")
        .appendField(" object threshold")
        .appendField(
          new Blockly.FieldNumber(0.5, 0.1, 0.99),
          "object_threshold"
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_yolo_init_model"] = function (block) {
    var iou_threshold = block.getFieldValue("iot_threshold");
    var obj_threshold = block.getFieldValue("object_threshold");
    var code = `
      const MAX_BOXES = 10;
      this.term.write("Loading model\\r\\n");
      await this.initModel();
      this.term.write("Model loaded\\r\\nLoading label : ");
      const __labels = await this.getLabels();
      this.term.write(__labels.join(",") + "\\r\\n");
      this.term.write("Anchors : ");
      const __anchors = this.project.anchors;
      this.term.write(__anchors.join(",") + "\\r\\n");
      let inputShape = this.model.layers[0].inputSpec[0].shape;
      this.term.write("Model Input Shape : " + inputShape.join(",") + "\\r\\n");
      this.term.write("Preloading model\\r\\n");
      const zeroTensor = tf.zeros([1, inputShape[1], inputShape[2], inputShape[3]], 'int32');
      const result = await this.model.predict(zeroTensor);
      const res = await result.data();
      result.dispose();
      zeroTensor.dispose();
      this.term.write("Preload model success\\r\\n");
      const load_image = function(url){
        return new Promise((resolve, reject) => {
          const im = new Image();
          im.crossOrigin = 'anonymous';
          im.src = url;
          im.onload = () => {
            resolve(im)
          }
        });
      };
      const __detect = async function(model, img){
        let inputShape = model.layers[0].inputSpec[0].shape;
        const batched = tf.tidy(()=>{
          const normalized = tf.add(tf.mul(tf.cast(img, 'float32'), (2 / 255.0)), -1); //min -1 to max 1
          let resized = tf.image.resizeBilinear(normalized, [inputShape[1], inputShape[2]], true); //alignCorners = true;
          const batched = tf.reshape(resized, [-1, inputShape[1], inputShape[2], 3]); //return tf.expandDims(img);
          return batched;
        });
        let res = await model.predict(batched);
        //TODO : check img.shape, may be cast to [img.shape[1],img.shape[0]]
        //console.log("img shape = ", img.shape);
        let boxes = await yolo.postProcess(res, __anchors, __labels.length, __labels, [img.shape[0],img.shape[1]], MAX_BOXES, ${obj_threshold}, ${iou_threshold});
        return boxes;
      }
      let __raw_image = "";
      let __image = null;
      let __image_tensor = null;
      let __bboxes = [];
      this.term.write("Model loaded\\r\\n");
    `;
    return code;
  };

  Blockly.Blocks["tfjs_yolo_detect"] = {
    init: function () {
      this.appendDummyInput().appendField("detect object");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_yolo_detect"] = function (block) {
    var code = `
      __raw_image = "data:image/jpeg;base64," + this.$refs.simulator.$refs.gameInstance.contentWindow.ImageBase64();
      __image = await load_image(__raw_image);
      __image_tensor = await tf.browser.fromPixels(__image);
      __bboxes = await __detect(this.model, __image_tensor);
      this.result = __bboxes;
      this.term.write("\\rdetection result, found box(es) = " + __bboxes.length);
      if(this.result.length){
        this.term.write(" (0 [" + 
          " x1:" + __bboxes[0].left.toFixed(1) + 
          " ,y1:" + __bboxes[0].top.toFixed(1) +
          " ,x2:" + __bboxes[0].right.toFixed(1) +
          " ,y2:" + __bboxes[0].bottom.toFixed(1) +
          " ,area:" + __bboxes[0].area.toFixed(2) +
          " ,label:" + __bboxes[0].class +
          " ,prob:" + __bboxes[0].score.toFixed(4) +
        " ])" );
      }
    `;
    return code;
  };

  Blockly.Blocks["tfjs_yolo_get_object_length"] = {
    init: function () {
      this.appendDummyInput().appendField("get detected object count");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.JavaScript["tfjs_yolo_get_object_length"] = function (block) {
    var code = "(__bboxes.length || 0)";
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks["tfjs_yolo_get_object_info"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("get")
        .appendField(
          new Blockly.FieldDropdown([
            ["classname", "classname"],
            ["probability", "probability"],
            ["class index", "class_index"],
            ["width", "width"],
            ["height", "heigh"],
            ["centerX", "centerX"],
            ["centerY", "centerY"],
            ["area", "area"],
          ]),
          "infotype"
        )
        .appendField(" of object index");
      this.appendValueInput("n").setCheck("Number");
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.JavaScript["tfjs_yolo_get_object_info"] = function (block) {
    var dropdown_infotype = block.getFieldValue("infotype");
    var value_n = Blockly.JavaScript.valueToCode(
      block,
      "n",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    let result = "";
    if (dropdown_infotype == "classname") {
      result = `__bboxes[${value_n}].class`;
    } else if (dropdown_infotype == "probability") {
      result = `__bboxes[${value_n}].score`;
    } else if (dropdown_infotype == "class_index") {
      result = `__bboxes[${value_n}].index`;
    } else if (dropdown_infotype == "width") {
      result = `__bboxes[${value_n}].width`;
    } else if (dropdown_infotype == "heigh") {
      result = `__bboxes[${value_n}].height`;
    } else if (dropdown_infotype == "centerX") {
      result = `__bboxes[${value_n}].centerX`;
    } else if (dropdown_infotype == "centerY") {
      result = `__bboxes[${value_n}].centerY`;
    } else if (dropdown_infotype == "area") {
      result = `__bboxes[${value_n}].area`;
    }
    var code = result;
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  //=====================================//

  Blockly.Blocks["move"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Linear velocity")
        .appendField(new Blockly.FieldNumber(0, -0.15, 0.15), "lin")
        .appendField("Angular velocity")
        .appendField(new Blockly.FieldNumber(0, -0.5, 0.5), "ang");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move"] = function (block) {
    var number_lin = block.getFieldValue("lin");
    var number_ang = block.getFieldValue("ang");
    var code =
      "this.$refs.simulator.$refs.gameInstance.contentWindow.VK_MovementDirec(" +
      number_lin +
      " ," +
      number_ang +
      ");\n";
    return code;
  };
  Blockly.Blocks["delay"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("delay")
        .appendField(new Blockly.FieldNumber(0), "ms")
        .appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["delay"] = function (block) {
    var number_ms = block.getFieldValue("ms");
    var code = "await new Promise(r => setTimeout(r," + number_ms + "));\n";
    return code;
  };
};

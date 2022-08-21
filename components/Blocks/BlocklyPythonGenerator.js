export default (Blockly, that) => {
  Blockly.Python["start_object_detector"] = function (block) {
    var cc =
      "import rosnode\nimport subprocess\nimport time\nimport os\nros_nodes = rosnode.get_node_names()\nif not '/image_feature' in ros_nodes:\n";
    cc =
      cc +
      "\tcommand='rosrun kidbright_tpu tpu_detect.py " +
      process.env.VUE_APP_ROOT +
      "/" +
      this.$store.getters.getProjectDir +
      "'\n";
    cc =
      cc +
      "\tprocess = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)\n\ttime.sleep(10) \n";

    return cc;
  }.bind(that);

  Blockly.Python["start_image_classification"] = function (block) {
    var cc =
      "import rosnode\nimport subprocess\nimport time\nimport os\nros_nodes = rosnode.get_node_names()\nif not '/image_class' in ros_nodes:\n";
    cc =
      cc +
      "\tcommand='rosrun kidbright_tpu tpu_classify.py " +
      process.env.VUE_APP_ROOT +
      "/" +
      this.$store.getters.getProjectDir +
      "'\n";
    cc =
      cc +
      "\tprocess = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)\n\ttime.sleep(10) \n";

    return cc;
  }.bind(that);

  Blockly.Python["start_wake_word_detector"] = function (block) {
    var dur = this.$store.getters.getProjDescription;
    //console.log("==========> Duraion is =======>");
    //console.log(dur.Duration*4);
    var nf = dur.Duration * 4;
    var cc =
      "import rosnode\nimport subprocess\nimport time\nimport os\nros_nodes = rosnode.get_node_names()\nif not '/wake_class_wait' in ros_nodes:\n";
    cc =
      cc +
      "\tcommand='rosrun kidbright_tpu wakeword_classify.py " +
      "_terminate:=False " +
      "_model:=" +
      process.env.VUE_APP_ROOT +
      "/" +
      this.$store.getters.getProjectDir +
      "/audios/model.h5 " +
      "label_file:=" +
      process.env.VUE_APP_ROOT +
      "/" +
      this.$store.getters.getProjectDir +
      "/audios/label_map.pkl " +
      "_nframe:=" +
      nf.toString() +
      "'\n";
    cc =
      cc +
      "\tprocess = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)\n\ttime.sleep(10) \n";

    return cc;
  }.bind(that);

  Blockly.Python["init_ros_node"] = function (block) {
    var code =
      "from geometry_msgs.msg import Twist\nimport rospy\nimport time\nrospy.init_node('get_center', anonymous=True)\nvelocity_publisher = rospy.Publisher('/cmd_vel', Twist, queue_size=1)\nvel_msg = Twist()\n";

    code =
      code +
      "import roslib\nimport rospy\nfrom kidbright_tpu.msg import tpu_object\nfrom kidbright_tpu.msg import tpu_objects\nfrom std_msgs.msg import String\n";
    return code;
  };

  Blockly.Blocks["get_objects"] = {
    init: function () {
      this.appendDummyInput().appendField("get objects");
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["get_classes"] = {
    init: function () {
      this.appendDummyInput().appendField("get classes");
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["get_sound"] = {
    init: function () {
      this.appendDummyInput().appendField("get sound");
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["sumorobot_opponent"] = {
    init: function () {
      this.setColour("#0099E6");
      this.appendDummyInput().appendField("opponent");
      this.setOutput(true, "Boolean");
    },
  };

  Blockly.Blocks["start_object_detector"] = {
    init: function () {
      this.appendDummyInput().appendField("Start object detector");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["start_image_classification"] = {
    init: function () {
      this.appendDummyInput().appendField("Start image classification");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["start_wake_word_detector"] = {
    init: function () {
      this.appendDummyInput().appendField("Start wake word detector");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["init_ros_node"] = {
    init: function () {
      this.appendDummyInput().appendField("ROS node initialization");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["rospy_loop"] = {
    init: function () {
      this.appendDummyInput().appendField("ROS LOOP");
      this.appendStatementInput("DO")
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["get_object_attr"] = {
    init: function () {
      this.appendValueInput("VAR")
        .setCheck(null)
        .appendField("get")
        .appendField(
          new Blockly.FieldDropdown([
            ["cx", "cx"],
            ["cy", "cy"],
            ["width", "width"],
            ["height", "height"],
            ["label", "label"],
          ]),
          "DATA_FIELD"
        )
        .appendField(" from");
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["set_velocity"] = {
    init: function () {
      this.appendDummyInput().appendField("move with ");
      this.appendDummyInput()
        .appendField("linear velocity")
        .appendField(new Blockly.FieldNumber(0), "LINEAR");
      this.appendDummyInput()
        .appendField("angular velocity")
        .appendField(new Blockly.FieldNumber(0), "ANGULAR");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["delay"] = {
    init: function () {
      this.appendDummyInput().appendField("delay");
      this.appendValueInput("NAME").setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Python["set_velocity"] = function (block) {
    var number_linear = block.getFieldValue("LINEAR");
    var number_angular = block.getFieldValue("ANGULAR");
    var code =
      "vel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\n";
    code =
      code +
      "vel_msg.linear.x = " +
      number_linear +
      "\n" +
      "vel_msg.angular.z = " +
      number_angular +
      "\n";
    code = code + "velocity_publisher.publish(vel_msg)\n";

    return code;
  };

  Blockly.Python["get_object_attr"] = function (block) {
    var dropdown_data_field = block.getFieldValue("DATA_FIELD");
    var value_var = Blockly.Python.valueToCode(
      block,
      "VAR",
      Blockly.Python.ORDER_ATOMIC
    );
    // TODO: Assemble Python into code variable.
    console.log(block.getFieldValue("DATA_FIELD"));
    var code = value_var + "." + block.getFieldValue("DATA_FIELD");
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
  };

  Blockly.Python["rospy_loop"] = function (block) {
    var statements_name = Blockly.Python.statementToCode(block, "NAME");
    // TODO: Assemble Python into code variable.
    var branch = Blockly.Python.statementToCode(block, "DO");
    branch = Blockly.Python.addLoopTrap(branch, block) || Blockly.Python.PASS;
    var code = "while not rospy.is_shutdown():\n" + branch;
    return code;
  };

  Blockly.Python["get_objects"] = function (block) {
    var code =
      "rospy.wait_for_message('/tpu_objects', tpu_objects, timeout=4).tpu_objects";
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
  };

  Blockly.Python["get_classes"] = function (block) {
    // TODO: Assemble Python into code variable.
    var code =
      "rospy.wait_for_message('/tpu_objects', tpu_objects, timeout=4).tpu_objects";
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
  };

  Blockly.Python["get_sound"] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = "rospy.wait_for_message('/inference', String, timeout=4).data";
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
  };

  Blockly.Python["delay"] = function (block) {
    var value_name = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC
    );
    // TODO: Assemble Python into code variable.
    var code = "time.sleep(" + value_name + ")\n";
    return code;
  };
};

var pid_controller, flying_box, kp, ki, kd, pid_state;

function setup() {
  createCanvas(400, 600);
  rectMode(CENTER);
  textSize(14);
  
  pid_controller = new PID(0.05, 0.0, 0, 250);
  flying_box = new FlyingBox(200, 600);
  
  kp = createSlider(0, 0.4, 0.04, 0.04);
  ki = createSlider(0, 0.05, 0.005, 0.005);
  kd = createSlider(0, 0.01, 0.000, 0.001);
  pid_state = createCheckbox('Enable PID', true);
  
  kp.position(120, 40);
  ki.position(120, 65);
  kd.position(120, 90);
  pid_state.position(20, 8);
  
  kp.style('width', '230px');
  ki.style('width', '230px');
  kd.style('width', '230px');
}

function draw() {
  flying_box.update(pid_controller.control_signal());
  pid_controller.feedback(flying_box.get_height());  
  pid_controller.kp = kp.value();
  pid_controller.ki = ki.value();
  pid_controller.kd = kd.value();
  pid_controller.state = pid_state.checked();
  
  
  background(240);  
  stroke(255, 0, 0);
  line(0, height-250, width, height-250);
  flying_box.draw();
  noStroke()
  // text("PID state: " + (pid_controller.state ? "enabled" : "disabled"), 10, 20);
  text("Kp: " + kp.value().toFixed(3), 35, 50 + 5);
  text("Ki: " + ki.value().toFixed(3), 35, 75 + 5);
  text("Kd: " + kd.value().toFixed(3), 35, 100 + 5);
  
  // Box enclosing the three sliders
  let h = 40;
  noFill();
  stroke(0);
  rectMode(CORNER);
  rect(25,75-h-1, width-50, 2*h, 10);
}

class FlyingBox {  
  constructor(x, h) {
    this.x = x;
    this.h = h;
    this.velocity = 0;
    this.gravity = -0.48;
    this.mass = 5;
  }
  
  update(control_signal) {
    let acceleration = this.gravity + (control_signal > 0 ? control_signal / this.mass : 0);
    this.velocity += acceleration;
    
    // Simulates the floor
    if (this.h + this.velocity >= 25) {
      this.h += this.velocity;
    } else {
      this.h = 25;
      this.velocity = 0;
    }
  }
  
  get_height() {
    return this.h;
  }
  
  draw() {
    rectMode(CENTER);
    fill(50);
    noStroke();
    square(this.x, height-this.h, 50);
  }
}

class PID {
  constructor(kp, ki, kd, goal) {
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
    this.goal = goal;
    this.error = 0;
    this.p_error = 0;
    this.integral_error = 0;
    this.state = true;
  }

  feedback(current_value) {
    this.p_error = this.error;
    this.error = this.goal - current_value;
    this.integral_error += this.error * (deltaTime / 1000);
  }

  control_signal() {
    if (this.state) {
      return this.proportional_gain() + this.integral_gain() + this.derivative_gain();
    } else {
      return 0;
    }
  }

  proportional_gain() {
    return this.kp * this.error;
  }

  integral_gain() {
    return this.ki * this.integral_error;
  }

  derivative_gain() {
    return this.kd * (this.error - this.p_error) / (deltaTime / 1000);
  }

  enable() {
    this.state = true;
  }

  disable() {
    this.state = false;
  }
}
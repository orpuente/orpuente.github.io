function gradientLine(context, x1, y1, x2, y2, color1, color2) {
  // linear gradient from start to end of line
  context.push();
  var grad = context.drawingContext.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  context.drawingContext.strokeStyle = grad;
  context.line(x1, y1, x2, y2);
  context.pop();
}

function coloredSquare(context, x, y, s, c0, c1, c2, c3) {
  context.push();
  context.stroke(c0);
  context.line(x, y + s, x + s, y + s);
  context.stroke(c1);
  context.line(x + s, y + s, x + s, y);
  context.stroke(c2);
  context.line(x + s, y, x, y);
  context.stroke(c3);
  context.line(x, y, x, y + s);
  context.pop();
}
// THYLORA · Hidden key foot pad
// Four pads go on the back/bottom of the statue (double-sided tape on top).
// All four look the same. One has a slot that the filing-cabinet key slides into
// from the edge that faces the wall, so it cannot be seen from the front.
// Underneath each pad: a felt or rubber dot, so it reads as a normal cushion foot.
//
// MEASURE THE REAL KEY FIRST, then change the numbers below.
// Print in a filament that matches the statue's color, or print in white and paint.
// Do NOT print in plain black unless the statue is black.

/* [Key: measure with a ruler or calipers, in millimetres] */
key_length    = 50;   // tip to end of the head
key_width     = 23;   // widest part, usually the head
key_thickness = 2.2;  // thickest part

/* [Pad] */
clearance   = 0.6;    // extra room around the key so it slides
wall        = 2.0;    // plastic around the slot
floor_t     = 1.6;    // plastic under the slot
corner_r    = 5;      // rounded corners
grip_bump   = 0.35;   // small bump that holds the key in; 0 = none
with_slot   = true;   // false makes the three matching decoys

pad_l = key_length + clearance + wall;          // open on one end
pad_w = key_width  + 2*clearance + 2*wall;
pad_h = floor_t + key_thickness + clearance + wall;

module rounded_box(l, w, h, r) {
  hull() for (x = [r, l - r], y = [r, w - r]) translate([x, y, 0]) cylinder(r = r, h = h, $fn = 48);
}

difference() {
  rounded_box(pad_l, pad_w, pad_h, corner_r);
  if (with_slot) {
    // Slot opens at x = pad_l (the edge that faces the wall).
    translate([wall, wall, floor_t])
      cube([key_length + clearance + 1, key_width + 2*clearance, key_thickness + clearance]);
    // Finger notch so the key can be pushed out.
    translate([pad_l, pad_w/2, floor_t + (key_thickness + clearance)/2])
      rotate([0, 90, 0]) cylinder(r = 4, h = 6, center = true, $fn = 32);
  }
}

// Grip bump: a thin ridge across the slot floor near the opening.
if (with_slot && grip_bump > 0)
  translate([pad_l - wall - 3, wall, floor_t])
    cube([1.2, key_width + 2*clearance, grip_bump]);

// Print flat, top-down as modelled, 0.2 mm layers, 20% infill, no supports needed
// for slots under ~25 mm wide (bridging). Test-fit with the real key before the
// final color print.

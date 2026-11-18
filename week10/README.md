# Week 10: Performable Audiovisual Instrument (Option 1)

This README documents the design iterations, technical challenges, ergonomic adjustments, and current user instructions for my performable audiovisual instrument created using p5.js and ml5.js.

## Concept & Inspiration

The core concept of using left-hand finger counting to select chords was inspired by a Mac application I tested called **Airmony**.

## Design Iterations & Problem Solving

### 1. Pitch and Volume Control

- **Initial Setup:** Index fingertip height ($y$-axis) determined the pitch, while the distance between the thumb and index finger controlled the volume.
- **The Problem:** When pinching my fingers to decrease volume, my fingertip naturally moved downward, causing the pitch to drop unexpectedly.
- **The Solution:** I modified the interaction so that the thumb-to-index distance directly controls pitch while keeping volume fixed.
- **Minor Key Toggle:** Tilting the left hand inward switches to a minor key. Initially, slight hand movements caused accidental triggers, so I adjusted the sensitivity to require a more exaggerated tilt angle.

### 2. Visual Effects & macOS Reactions

- **Floating Balloons:** macOS has a built-in "Reactions" feature that automatically triggers visual effects for specific hand gestures. Making a peace/victory sign automatically spawns floating balloons on the video stream—which happened to coincide with my gesture for playing the **ii chord**!

### 3. Right-Hand Melody & Interaction Experiments

- **Distance Pinching:** I initially mapped pinch distance to play 4 chord tones. To reduce monotony, I expanded this to a 7-note scale. However, controlling precise physical distances proved too difficult for smooth performance, and moving between distances unintentionally triggered intermediate notes.
- **On-Screen Grid Touching:** Next, I tried triggering notes by touching visual grid blocks on screen. However, as my finger moved across the canvas, every grid cell crossed sounded off. Attempting to implement a "click" gesture failed because the webcam was unreliable at detecting hand-click depth.
- **Final Solution (Finger-to-Thumb Pinching):** I returned to playing chord tones, but replaced distance measurement with discrete finger pinches: pinching each of the four fingers (index, middle, ring, pinky) to the thumb maps directly to the 4 notes of a 7th chord. This made performance much easier to control.
- **Ergonomic Observation:** Through physical playtesting, I noticed that repeated pinky-to-thumb pinching led to hand fatigue and mild cramping—an important physical interaction constraint to consider for future refinement.

---

## User Manual / How to Play

- **Left Hand (Chord Selection & Key Toggle):**
  - **Fingers Extended (1–5):** Selects the 5 diatonic chords in C Major (or Minor).
  - **Pinky-to-Thumb Pinch:** Triggers the 6th chord; adding the index finger selects the 7th chord.
  - **Hand Tilt:** Exaggerate left-hand inward tilt to switch to Minor mode.

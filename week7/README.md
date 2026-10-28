A Snowy Room Hidden in the Wall

Concept & Idea
There is a very noticeable corner in my room, so I wanted to project onto it to create a small, hidden space inside the wall. Initially, I wanted to create an aquarium effect. However, as the coding process didn't go as smoothly as planned, I pivoted to creating a room where it is snowing.

Production Process
1. Building the Room
I planned to use four quads to construct the faces of a cube: ceiling, left wall, right wall, and floor. To avoid confusion during calibration, I labeled each corner with a number.
2. Shading & Depth
Next, I used color gradients to establish light and shadow relationships, creating a believable sense of 3D depth.
3. Snowfall Effect
Then I added the snowfall particle effect. At first, snow fell on the ceiling as well, and I adjusted its direction: having it fall straight top-to-bottom like on the walls felt wrong, so it needed to move diagonally from corner 1 toward corner 4. Later, I realized snowing on the ceiling still looked unnatural, so I adjusted it so snow only fell on the two wall surfaces.
4. Snowy Floor
I changed the floor to an off-white gradient, making it feel more like a ground covered in snow.
5. Christmas Tree
After finishing the snow, I added a Christmas tree inside the room. At first, I planned to split the tree across the two walls and draw the roots on the floor, but the visual result was poor and lacked 3D depth. To fix this, I added a new quad with a transparent background, placed it upright in the middle of the room, and drew the Christmas tree on it.
6. Snow in Front of the Tree
During review, I noticed that snow was only drifting on the two back walls while there was no snow in front of the tree, which broke the sense of realism. So I added a snowfall effect to the tree's quad plane as well. To avoid harsh boundaries, I made the snowflakes fade out as they approached the edges of the quad to hide the plane's outline.
7. Correcting Perspective
During actual projection, I felt the perspective was slightly off. After reflecting on it, I realized that from this viewing angle, the ceiling shouldn't actually be visible, so I dragged the ceiling quad to an unseen corner.
Note: During the process, I pressed s frequently to save, as the browser had auto-refreshed once before, forcing me to recalibrate all corner points from scratch.

Results & Future Improvements
The final output turned out quite well, but there are a few key areas I can improve in future iterations:
Floor Alignment: After a friend with a background in art reviewed it with me, I realized that the edges of the floor quad should remain strictly parallel to the physical corner lines of the wall.
Enhancing Contrast: The gradient values for wall shading could be pushed much further apart to create stronger contrast. Because physical projection naturally washes out contrast, having a greater light-to-dark difference directly in code will make the 3D space appear more dimensional and vivid.
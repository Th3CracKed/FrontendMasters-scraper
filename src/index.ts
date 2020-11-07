import axios from 'axios';
import { Course } from './model/course';
import fs from 'fs'

const headers = {
  authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IjMxNTlmYTM0LTNmOWQtMzRhZi05MGJhLTRhOTlmZDUzZDJlOSIsImVtYWlsIjoiQWJkZWxnaGFmb3VyLkRyaW93eWFAZXR1LnVuaXYtZ3Jlbm9ibGUtYWxwZXMuZnIiLCJyb2xlIjoiU3Vic2NyaWJlciJ9.pF-EAq5VOMBVFijWkJJW6-G_CqwrY8ydenvlhSetNkw',
  'x-client-platform': 'android'
};

(async function () {
  try {
    const courses: Course[] = await axios.get('https://api.frontendmasters.com/v2.3/m/courses/?limit=9999', { headers });
    const courseId = courses[0].hash;
    // ignore courses[0].state archived,(scheduled ?)
    const course: Course = await axios.get(`https://api.frontendmasters.com/v2.3/m/courses/${courseId}/`, { headers });
    // TODO create folder with courses[0].title
    // TODO course?.resources save
    
    course?.lessonGroups?.forEach(lessonGroup => {
      // fs.existsSync()
      // TODO create folder lessonGroup?.title;
      lessonGroup?.lessons;
    });
  } catch (err) {
    console.error(err);
  }
}())
import axios, { AxiosResponse } from 'axios';
import { Resolver } from 'dns';
import fs from 'fs'
import path from 'path';
import R from 'ramda';
import { Course, Lesson } from './model/course';
import { chainAllTasksInSeries } from './services/utils';

const headers = {
  authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IjMxNTlmYTM0LTNmOWQtMzRhZi05MGJhLTRhOTlmZDUzZDJlOSIsImVtYWlsIjoiQWJkZWxnaGFmb3VyLkRyaW93eWFAZXR1LnVuaXYtZ3Jlbm9ibGUtYWxwZXMuZnIiLCJyb2xlIjoiU3Vic2NyaWJlciJ9.pF-EAq5VOMBVFijWkJJW6-G_CqwrY8ydenvlhSetNkw',
  'x-client-platform': 'android'
};
const saveFolderPath = '../video';

(async function downloadAllCourses() {
  try {
    const courses: AxiosResponse<Course[]> = await axios.get('https://api.frontendmasters.com/v2.3/m/courses/?limit=9999', { headers });
    const requestVideosFactoriesPromises = await Promise.all(courses?.data.map(async currentCourse => {
      return createAsyncFactoryToDownloadCourse(currentCourse);
    }));
    const result = await chainAllTasksInSeries(requestVideosFactoriesPromises);
    console.log(result);
    fs.writeFileSync(path.resolve(__dirname, saveFolderPath, 'result.json'), JSON.stringify(result));
  } catch (err) {
    console.error(err);
  }
}());

function createAsyncFactoryToDownloadCourse(currentCourse: Course): (() => Promise<string>) | PromiseLike<() => Promise<string>> {
  return () => new Promise<string>(async (resolve, reject) => {
    try {
      const courseId = currentCourse?.hash;
      if (!courseId || ['archived', 'obsolete'].includes(currentCourse?.state?.stateType)) {
        console.log(`course = ${courseId} ${currentCourse?.title} is undefined, archived or obsolete`);
        resolve(`course = ${courseId} ${currentCourse?.title} is undefined, archived or obsolete`);
        return;
      }
      console.log(`-----Getting Course ${currentCourse?.title} Detail-----`);
      const response: AxiosResponse<Course> = await axios.get(`https://api.frontendmasters.com/v2.3/m/courses/${courseId}/`, { headers });
      if (!response) {
        console.log(`undefined axios response for ${courseId}`);
        resolve(`undefined axios response for ${courseId}`);
        return;
      }
      const suffix = currentCourse?.state?.stateType === 'updated' || currentCourse?.state?.targetID ? '__updated' : '';
      const courseFolder = removeIllegalCharacter(currentCourse?.title);
      const coursePath = `${saveFolderPath}/${courseFolder + suffix}`;
      if (fs.existsSync(path.join(__dirname, coursePath))) {
        console.log(`----------Course : ${currentCourse?.title} Already Exists------------`);
        resolve(`----------Course : ${currentCourse?.title} Already Exists------------`);
        return;
      }
      console.log(`Creating folder ${coursePath}`);
      fs.mkdirSync(path.join(__dirname, coursePath), { recursive: true });
      const courseDetail = response?.data;
      console.log(`CourseDetail title : ${courseDetail?.title}`);
      fs.writeFileSync(path.resolve(__dirname, coursePath, 'info.json'), JSON.stringify(courseDetail));
      const result = await downloadCourse(courseDetail, coursePath);
      console.log(result);
      fs.writeFileSync(path.resolve(__dirname, coursePath, 'result.json'), JSON.stringify(result));
      resolve(`Download course : ${currentCourse.title} finished`);
    } catch (err) {
      reject(err);
    }
  });
}

function removeIllegalCharacter(value: string) {
  return value.replace(/[/\\?%*:|"<>]/g, '');
}

function downloadCourse(course: Course, coursePath: string) {
  console.log(`----------Downloading ${course?.title}-------------`);
  const requestVideosFactoriesPromises = R.flatten((course?.lessonGroups || []).map(lessonGroup => {
    const lessonGroupPath = `${coursePath}/${removeIllegalCharacter(lessonGroup?.title)}`;
    fs.mkdirSync(path.join(__dirname, lessonGroupPath), { recursive: true });
    return lessonGroup?.lessons?.map(lesson => {
      return () => new Promise<string>(async (resolve, reject) => {
        try {
          await downloadLesson(lesson, lessonGroupPath);
          resolve(`----------Download lesson : ${lesson.title} finished----------`);
        } catch (err) {
          reject(err);
        }
      });
    });
  }));
  return chainAllTasksInSeries(requestVideosFactoriesPromises);
}

/**
 * Download a video with mp4 format
 * @param lesson to download
 * @param folder to store the video
 */
async function downloadLesson(lesson: Lesson, folder: string) {
  console.log(`Downloading ${lesson?.title}`);
  try {
    const response = await axios.get(`https://api.frontendmasters.com/v2.3/m/video/${lesson?.hash}/source/?r=720&f=mp4`, {
      headers,
      responseType: 'stream'
    });
    console.log('Download successfully ! writing to disk');
    const writer = fs.createWriteStream(path.resolve(__dirname, folder, `${removeIllegalCharacter(lesson?.title)}.mp4`));

    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      const onFinish = () => {
        console.log(`Finished Downloading ${lesson?.title}`);
        resolve();
      }
      writer.on('finish', onFinish);
      writer.on('error', reject);
    });
  } catch (err) {
    console.log('Download Failed');
    console.log(err);
    return Promise.resolve();
  }
}

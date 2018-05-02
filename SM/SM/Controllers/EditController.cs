using NAudio.Wave;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using PowerPoint = Microsoft.Office.Interop.PowerPoint;
using System.Runtime.InteropServices;
using NReco.VideoConverter;
using Microsoft.Office.Core;

namespace SM.Controllers
{
    public class EditController : Controller
    {
        static PowerPoint.Application objApp;


        // GET: Edit
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult UploadAudio(HttpPostedFileBase audio1, HttpPostedFileBase audio2)
        {
            if (audio1 != null)
            {
                audio1.SaveAs(HttpContext.Server.MapPath("~/Content/") + audio1.FileName);
            }

            if (audio2 != null)
            {
                audio2.SaveAs(HttpContext.Server.MapPath("~/Content/") +  audio2.FileName);
            }

            string Name1 = "";
            string Name2 = "";

            Name1 = audio1?.FileName;
            Name2 = audio2?.FileName;


            return Json(new { name1 = Name1, name2 = Name2 });
        }

        public ActionResult Reverse(string name)
        {
            var a  = name.Split('.');

            string newName = a[a.Length - 2];

            if (a[a.Length - 1] == "mp3")
            {
                using (Mp3FileReader reader = new Mp3FileReader(HttpContext.Server.MapPath("~/Content/" + name)))
                {
                    WaveFileWriter.CreateWaveFile(HttpContext.Server.MapPath("~/Content/" + newName + ".wav"), reader);
                }
            }

            using (WaveFileReader reader = new WaveFileReader(HttpContext.Server.MapPath("~/Content/" + newName + ".wav")))
            {
                int blockAlign = reader.WaveFormat.BlockAlign;
                using (WaveFileWriter writer = new WaveFileWriter(HttpContext.Server.MapPath("~/Content/" + newName + "_rev.wav"), reader.WaveFormat))
                {
                    byte[] buffer = new byte[blockAlign];
                    long samples = reader.Length / blockAlign;
                    for (long sample = samples - 1; sample >= 0; sample--)
                    {
                        reader.Position = sample * blockAlign;
                        reader.Read(buffer, 0, blockAlign);
                        writer.WriteData(buffer, 0, blockAlign);
                    }
                }
            }

            return Json(new {name1 = newName + "_rev.wav" }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult VideoConvert(HttpPostedFileBase video, string toFormat)
        {
            string path = HttpContext.Server.MapPath("~/Content/" + video.FileName);
            string outpath = HttpContext.Server.MapPath("~/Content/video." +  toFormat);
            var ffMpeg = new FFMpegConverter();
            var set =  new ConvertSettings()
            {
                CustomOutputArgs = "-b 4000k -minrate 4000k -maxrate 4000k"
            };

            video.SaveAs(path);

            switch (toFormat)
            {
                case "mp4":
                    ffMpeg.ConvertMedia(path, null, outpath, Format.mp4, set);
                    break;
                case "avi":
                    ffMpeg.ConvertMedia(path, null, outpath, Format.avi, set);
                    break;
                case "wmv":
                    ffMpeg.ConvertMedia(path, null, outpath, Format.wmv, set);
                    break;
                case "mkv":
                    ffMpeg.ConvertMedia(path, null, outpath, Format.matroska, set);
                    break;
                case "mov":
                    ffMpeg.ConvertMedia(path, null, outpath, Format.mov, set);
                    break;
                default:
                    return Content("");
            }

            return Json(new { succes = true, link = "http://sm.com/Content/video." + toFormat  });
        }

        [HttpPost]
        public ActionResult UploadVideo(HttpPostedFileBase video)
        {
            string path = HttpContext.Server.MapPath("~/Content/" + video.FileName);
            video.SaveAs(path);

            return Json(new { succes = true, file = "http://sm.com/Content/" + video.FileName});
        }

        [HttpPost]
        public ActionResult Transform(HttpPostedFileBase pptx)
        {
            PowerPoint.Presentation objPres;

            try
            {
                pptx.SaveAs(HttpContext.Server.MapPath("~/Content/prezentare.pptx"));

                objApp = new PowerPoint.Application();
                objApp.Visible = Microsoft.Office.Core.MsoTriState.msoTrue;
                objApp.WindowState = PowerPoint.PpWindowState.ppWindowMinimized;
                var ppPath = HttpContext.Server.MapPath("~/Content/prezentare.pptx");
                var savePath = HttpContext.Server.MapPath("~/Content/video_pp");

                objPres = objApp.Presentations.Open(Path.GetFullPath(ppPath), MsoTriState.msoTrue, MsoTriState.msoTrue, MsoTriState.msoTrue);
                objPres.SaveAs(Path.GetFullPath(savePath), PowerPoint.PpSaveAsFileType.ppSaveAsWMV, MsoTriState.msoFalse);
                while (objApp.ActivePresentation.CreateVideoStatus == PowerPoint.PpMediaTaskStatus.ppMediaTaskStatusInProgress || objApp.ActivePresentation.CreateVideoStatus == PowerPoint.PpMediaTaskStatus.ppMediaTaskStatusQueued)
                {
                    System.Threading.Thread.Sleep(500);
                }

                objPres.Close();
                objApp.Quit();
                // Release COM Objects
                System.Runtime.InteropServices.Marshal.FinalReleaseComObject(objPres);
                objPres = null;
                System.Runtime.InteropServices.Marshal.FinalReleaseComObject(objApp);
                objApp = null;
                GC.Collect();
                GC.WaitForPendingFinalizers();

            }
            catch (Exception e)
            {
                System.Console.WriteLine("Error: " + e.Message);
                return Json(new { succes = false});

                objApp.Quit();
            }

            return Json(new { succes = true, link = "http://sm.com/Content/video_pp.wmv" });

        }

        [HttpPost]
        [ValidateInput(false)]
        public string BlackAndWhite(byte[] data)
        {
            Image img;
            using (var ms = new MemoryStream(data))
            {
                img =  Image.FromStream(ms);
            }

            ImageConverter converter = new ImageConverter();
            using (MemoryStream memory = new MemoryStream())
            {
                using (FileStream fs = new FileStream(@"C:\Fraps\jora.bmp", FileMode.Create, FileAccess.ReadWrite))
                {
                    img.Save(memory, ImageFormat.Jpeg);
                    byte[] bytes = memory.ToArray();
                    fs.Write(bytes, 0, bytes.Length);
                }
            }
            return Convert.ToBase64String((byte[])converter.ConvertTo(img, typeof(byte[])));
        }
    }
}
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace SM.Controllers
{
    public class EditController : Controller
    {
        // GET: Edit
        public ActionResult Index()
        {
            return View();
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
            /*
            Bitmap Bmp;
            using (var ms = new MemoryStream(data))
            {
                Bmp = new Bitmap(ms);
            }

            int rgb;
            Color c;

            for (int y = 0; y < Bmp.Height; y++)
                for (int x = 0; x < Bmp.Width; x++)
                {
                    c = Bmp.GetPixel(x, y);
                    rgb = (int)((c.R + c.G + c.B) / 3);
                    Bmp.SetPixel(x, y, Color.FromArgb(rgb, rgb, rgb));
                }

            using (var stream = new MemoryStream())
            {
                Bmp.Save(stream, System.Drawing.Imaging.ImageFormat.Bmp);
                string rez = Encoding.ASCII.GetString(stream.ToArray());
                return rez;
            }
            */
        }
    }
}
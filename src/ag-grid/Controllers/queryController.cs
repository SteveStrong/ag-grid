using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Microsoft.Net.Http;
using System.Net.Http;
using Microsoft.Net.Http.Headers;
using System.Text;
using System.IO;
using System.Net;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting;

//http://www.bizcoder.com/returning-raw-json-content-from-asp-net-web-api

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ag_grid.Controllers
{



    [Route("api/[controller]")]
    public class queryController : Controller
    {
        IHostingEnvironment _env;
        public queryController(IHostingEnvironment env)
        {
            _env = env;
        }
        public string GetFile(string name)
        {
            var path = _env.ContentRootPath + "\\App_Data\\" + name;

            var file = new FileStream(path, FileMode.Open);
            using (var reader = new StreamReader(file))
            {
                return reader.ReadToEnd();
            }
        }

        // GET: api/values
        [HttpGet]
        public JArray Get()
        {
            var buffer = GetFile("data.json");

            var builder = new StringBuilder();

            builder.Append(@"[");
            builder.Append(@"{ 'make': 'Toyota', 'model': 'Celica', 'price': 35000 },");
            builder.Append(@"{ make: 'xxToyota', model: 'xxCelica', price: 35000 },");
            builder.Append(@"{ 'make': 'Ford', 'model': 'Celica', 'Mondeo': 35000 },");
            builder.Append(@"{ 'make': 'Porsche', 'model': 'Mondeo', 'price': 35000 },");
            builder.Append(@"{ 'make': 'Ford', 'model': 'xxx', 'price': 35000 }");
            builder.Append(@"]");
            var str = builder.ToString();
            var json = JArray.Parse(buffer);

            return json;
            //return new HttpResponseMessage()
            //{
            //    Content = new StringContent(str, Encoding.UTF8, "application/json"),
            //    StatusCode = HttpStatusCode.OK
            //};
        }


    }
}

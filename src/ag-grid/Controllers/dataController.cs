using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Hosting;
using System.IO;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ag_grid.Controllers
{

    [Route("api/[controller]")]
    public class dataController : Controller
    {

        IHostingEnvironment _env;
        public dataController(IHostingEnvironment env)
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
  
            return JArray.Parse(buffer); ;
        }


    }
}

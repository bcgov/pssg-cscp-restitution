using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Serilog;
using System.Threading.Tasks;
using System;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public partial class JusticeController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IDynamicsResultService _dynamicsResultService;
        private readonly ILogger _logger;

        public JusticeController(IConfiguration configuration, IDynamicsResultService dynamicsResultService)
        {
            _configuration = configuration;
            this._dynamicsResultService = dynamicsResultService;
            _logger = Log.Logger;
        }

        [HttpPost("submitrestitution")]
        public async Task<IActionResult> SubmitRestitution([FromBody] RestitutionFormModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error($"API call to 'SubmitRestitution' made with invalid model state. Error is:\n{ModelState}. Source = Restitution");
                    return BadRequest(ModelState);
                }

                var endpointAction = "vsd_CreateRestitutionCase";
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.NullValueHandling = NullValueHandling.Ignore;
                var modelString = JsonConvert.SerializeObject(model, settings);
                _logger.Information("JSON Sent to vsd_CreateRestitutionCase: ");
                _logger.Information(modelString);
                DynamicsResult result = await _dynamicsResultService.Post(endpointAction, modelString);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while saving victim restitution. Source = Restitution", model);
                return BadRequest();
            }
            finally { }
        }
    }
}

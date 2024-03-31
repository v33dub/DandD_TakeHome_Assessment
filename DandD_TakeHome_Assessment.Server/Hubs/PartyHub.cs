using Microsoft.AspNetCore.SignalR;

namespace DandD_TakeHome_Assessment.Server.Hubs
{
    public class PartyHub : Hub
    {
        public async Task SendUpdate(string data)
        {
            await Clients.All.SendAsync("ReceiveUpdate", data);
        }
    }
}

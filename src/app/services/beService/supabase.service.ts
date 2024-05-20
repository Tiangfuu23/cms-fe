import { Injectable } from "@angular/core";
import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { ConfigStateService } from "../../shared/app-state/config-state.service";


const ONLINE_TRACKING_CHANNEL = 'online-tracking';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabaseClient !: SupabaseClient;
  private supabaseUrl : string = '';
  private supabaseKey : string = '';
  private trackingChannel !: RealtimeChannel;

  constructor(private configService : ConfigStateService) {
    this.configService.subscribe((m) => {
      this.supabaseUrl = m.supabaseUrl;
      this.supabaseKey = m.supabaseKey;
      this.supabaseClient = createClient(this.supabaseUrl, this.supabaseKey);
      console.log(this.supabaseClient);
    })
  }

  subscribeTrackingChannel(user : any, presenceSyncCb: (presenceState : any) => void) {
    this.trackingChannel = this.supabaseClient.channel(ONLINE_TRACKING_CHANNEL, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    this.trackingChannel.on('presence', {event: 'sync'}, () => {
      const newState = this.trackingChannel.presenceState();
      console.log('sync', newState);
      presenceSyncCb(newState);
    }).subscribe(async (status) => {
      if(status === 'SUBSCRIBED'){
        await this.trackingChannel.track({user});
      }
    })
  }

  unsubscribeTrackingChannel(){
    console.log("Unsubscribe tracking channel called!");
    this.trackingChannel?.unsubscribe();
  }
}

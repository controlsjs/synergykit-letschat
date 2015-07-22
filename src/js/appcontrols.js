/*
 * SynergyKit LetsChat Sample
 * http://controlsjs.com/
 *
 * Copyright (c) 2015 Position s.r.o.
 */

if(typeof ngUserControls === 'undefined') ngUserControls = new Array();

var chatLoggedIn  = 1;
var chatIamHere   = 2;
var chatUsers     = 3;

var AppControls = {
  OnInit: function() {
    ngRegisterControlType('appChatMessage', {
      Type: 'weFrame',
      L: 0,
      R: 0,
      Data: {
        Message: {}
      },
      Controls: {
        Img: {
          Type: 'ngImage',
          B: 5,
          Events: {
            OnGetImg: function(c) {
              var msg=c.Owner.Owner.Message;
              var ismine=msg ? msg.IsMine : false;
              if((msg)&&(typeof msg.status!=='undefined')) return null;
              return ismine ? WinEightControls.Images.HintAnchors.rightbottom.Img : WinEightControls.Images.HintAnchors.leftbottom.Img;
            }
          }
        },
        Hint: {
          Type: 'weText',
          L: 0, T: 0,
          W: 100,
          style: {
            color:'black',
            backgroundColor: 'white',
            border: '10px solid white'
          },
          Data: {
            AutoSize: true,
            AutoSizeMode:'vertical'
          },
          Events: {
            OnGetText: function(c) {
              var msg=c.Owner.Owner.Message;
              var txt='';
              if(msg) {
                txt+='<div style="text-align: right;font-size: 12px;'+(typeof msg.status==='undefined' ? 'padding-bottom:5px;' : '')+'">';
                var ts=msg.ReceivedTS;
                var now=new Date();
                if(!msg.IsMine) {
                  txt+=ng_htmlEncode(msg.user);
                  if(typeof msg.status!=='undefined') {
                    switch(msg.status) {
                      case chatLoggedIn: txt+=' logged in.'; break;
                      case chatIamHere: txt+=' is here.'; break;
                    }
                  }
                  txt+=' &nbsp;&nbsp;';
                }
                if((now.getDate()!=ts.getDate())||(now.getMonth()!=ts.getMonth())||(now.getFullYear()!=ts.getFullYear())) txt+=ng_FormatDate(ts)+'&nbsp;'
                txt+=ng_sprintf('%d:%02d',ts.getHours(),msg.ReceivedTS.getMinutes());
                txt+='</div>'
                if(typeof msg.status === 'undefined') {
                  txt+='<div>'+ng_htmlEncode(msg.message,true)+'</div>'
                }
              }
              return txt;
            },
            OnUpdate: function(c) {
              var o=c.Elm();
              var po=o ? o.offsetParent : null;
              po=po ? po.offsetParent : null;
              po=po ? po.offsetParent : null;
              var ww=ng_WindowWidth()
              var w=po ? ng_ClientWidth(po) : ww;
              if(!w) w=ww;
              var msg=c.Owner.Owner.Message;
              var ismine=msg ? msg.IsMine : false;
              var img=c.Owner.Img ? c.Owner.Img.GetImg() : null;
              var imgw=(img ? img.W-2 : 10);
              var l=Math.round(.2*w);
              if(ismine) c.Owner.Img.SetBounds({R:0});
              else c.Owner.Img.SetBounds({L:0});
              c.SetBounds({L: ismine ? l : imgw, W:w-l-20-imgw});
              return true;
            },
            OnUpdated: function(c,o) {
              c.Owner.Owner.SetBounds({H:c.Bounds.H+20});
              return true;
            }
          }
        }
      }
    });
  }
};


ngUserControls['AppControls'] = AppControls;
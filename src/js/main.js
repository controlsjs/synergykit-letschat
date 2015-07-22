/*
 * SynergyKit LetsChat Sample
 * http://controlsjs.com/
 *
 * Copyright (c) 2015 Position s.r.o.
 */

// --- Variables ---------------------------------------------------------------
var AppForm = null;

// --- String resources --------------------------------------------------------
if(typeof ngc_Lang === 'undefined') ngc_Lang=new Array();

// English
if(typeof ngc_Lang['en'] === 'undefined') ngc_Lang['en']=new Array();
ngc_Lang['en']['ngAppName']='SynergyKit LetsChat';
ngc_Lang['en']['ngAppCopyright']='Copyright © 2015 Position s.r.o.';

// --- Application -------------------------------------------------------------
var MsgId=0;
var HistorySize = 100;

function ngInit() {
  WinEightControls.ColorScheme='Blue';
  WinEightControls.Theme=WE_DARK;

  Synergykit.Init('controlsjsspeak-vj9k9', '37f820de-bfc8-45f0-941c-330f69a56638', {
      debug: ngDEBUG ? true : false
  });
}

function DeviceChanged(newdevice)
{
  UpdateLayout(newdevice);
  return true;
}

function UpdateLayout(device) {
  if(!AppForm) return;

  var hp=AppForm.ChatPanel.Elm();
  var ap=AppForm.AboutPanelContent.Elm();
  if(device === 'mobile') {
    if(hp) hp.style.marginLeft='0px';
    if(ap) ap.style.marginLeft='0px';
    AppForm.ChatPanel.SetBounds({L:0,R:0,W:undefined});
    AppForm.AboutPanelContent.SetBounds({L:0,R:0,W:undefined});
  }
  else
  {
    if(hp) hp.style.marginLeft='-290px';
    if(ap) ap.style.marginLeft='-290px';
    AppForm.ChatPanel.SetBounds({L:'50%',R:undefined,W:580});
    AppForm.AboutPanelContent.SetBounds({L:'50%',R:undefined,W:580});
  }
}
  
function LoginUser() {
  var email = AppForm.LoginEmail.GetText();
  var pass = AppForm.LoginPassword.GetText();
  
  if((email=='')||(pass=='')) return;

  var user = Synergykit.User();
  user.set("email", email);
  user.set("password",pass);    

  AppForm.LoginError.SetVisible(false);
  AppForm.LoginPanel.SetEnabled(false);

  user.login({
      success: function(user, statusCode) {
        AppForm.AppPages.SetPage(2);
        AppForm.UserEmail.SetText(email);
        AppForm.UserEmail.SetVisible(true);
        AppForm.LoginPassword.SetText('');
        AppForm.LoginPanel.SetEnabled(true);
        AppForm.History.Controls.Dispose();
        AppForm.Channel.SetListenSpeak(true);
        SendStatus(chatLoggedIn);
      },
      error: function(error, statusCode) {
        AppForm.UserEmail.SetText('');
        AppForm.UserEmail.SetVisible(false);
        AppForm.LoginPassword.SetText('');
        AppForm.LoginPanel.SetEnabled(true);
        AppForm.LoginError.Alt=error.message+' ('+statusCode+')';
        AppForm.LoginError.SetText('Login failed!');
        AppForm.LoginError.SetVisible(true);
      }
  });    
  
}

function RegisterUser() {
  var email = AppForm.RegisterEmail.GetText();
  var pass = AppForm.RegisterPassword.GetText();
  var pass2 = AppForm.RegisterPassword2.GetText();
  if(email=='') AppForm.RegisterEmail.SetInvalid(true);
  if((pass!=pass2)||(pass=='')) {
      AppForm.RegisterPassword.SetInvalid(true);
      AppForm.RegisterPassword2.SetInvalid(true);
      pass='';
  }
  if((email=='')||(pass=='')) return;
    
  var user = Synergykit.User();
  user.set("email", email);
  user.set("password",pass);    
  user.set("isActivated",true);    

  AppForm.RegisterError.SetVisible(false);
  AppForm.RegisterPanel.SetEnabled(false);
  user.save({
      success: function(user, statusCode) {
        AppForm.RegisterPanel.SetEnabled(true);
        AppForm.LoginEmail.SetText(email);
        AppForm.LoginPassword.SetText(pass);
        LoginUser();
      },
      error: function(error, statusCode) {
        AppForm.RegisterPanel.SetEnabled(true);
        AppForm.RegisterError.Alt=error.message+' ('+statusCode+')';
        AppForm.RegisterError.SetText('Registration failed!');
        AppForm.RegisterError.SetVisible(true);
      }
  });    
}

function SendMessage(msg)
{
  if(typeof msg === 'string') msg={message:msg};
  msg.user = AppForm.UserEmail.GetText();
  msg.ts =  new Date();
  AppForm.Channel.Speak(msg);  
}

function SendStatus(status)
{
  SendMessage({status:status});
}

function ProcessMessage(msg) {
  msg.IsMine=(msg.user===AppForm.UserEmail.GetText());
  msg.ReceivedTS=new Date;
  msg.CreatedTS=msg.ReceivedTS;
  if((msg.IsMine)&&(typeof msg.status !== 'undefined')) return; // Ignore my status messages  
  if(msg.status===chatLoggedIn) SendStatus(chatIamHere);
  if(msg.status===chatUsers)  { SendStatus(chatIamHere); return; }
  ShowMessage(msg);
}

function ShowMessage(msg)
{
  var cc=AppForm.History.ChildControls;
  if((cc)&&(cc.length>0)) {
    var last=cc[cc.length-1];
    if((last.Message)&&(last.Message.user===msg.user)&&(typeof msg.status === typeof last.Message.status)&&(msg.ReceivedTS.getTime()-last.Message.ReceivedTS.getTime()<600000)) {
      if(typeof msg.status === 'undefined') {
        last.Message.ReceivedTS=msg.ReceivedTS;
        last.Message.message+="\n"+msg.message;
        AppForm.History.Update();
        return;
      }
      else if(last.Message.status===msg.status) return;
    }
  }

  var m = {};
  MsgId++;
  m['Msg' + MsgId] = {
    Type: 'appChatMessage',
    Data: {
      Message: msg
    }
  };
  if(msg.IsMine) AppForm.History.FollowTail=true;
  AppForm.History.Controls.AddControls(m);
  var cc=AppForm.History.ChildControls;
  while((cc)&&(cc.length>HistorySize)) cc[0].Dispose();
  AppForm.History.Update();
}  

function ngMain()
{ 
  AppForm = new ngControls({
                    /* ControlsForm: 'AppForm' */
    Header: {
      Type: 'weColorPanel',
      L: 0,
      T: 0,
      H: 60,
      R: 0,
      Controls: {
        AppCaption: {
          Type: 'weCaption',
          L: 20,
          T: 19,
          ColorScheme: 'White',
          Data: { Text: 'SynergyKit LetsChat' }
        },
        AppAbout: {
          Type: 'weAppButton',
          R: 20,
          T: 14,
          Data: { Img: 'Help' },
          Events: {
            OnClick: function (e) {
              e.Owner.Check(e.Owner.Checked ? 0 : 1)
              AppForm.AboutPanel.SetVisible(e.Owner.Checked ? true : false);
            }
          }
        }
      }
    },
    AppPages: {
      Type: 'ngPages',
      L: 0,
      T: 60,
      R: 0,
      B: 40,
      style: { backgroundColor: '#525252' },
      Data: {
        Page: 0,
        PagesVisible: false
      },
      Pages: [
        {
          Text: 'Login Page',
          Controls: {
            LoginPanel: {
              Type: 'ngPanel',
              L: '50%',
              T: 73,
              W: 280,
              H: 280,
              style: { marginLeft: '-140px' },
              Controls: {
                LoginEmail: {
                  Type: 'weEdit',
                  L: 0,
                  T: 0,
                  R: 0,
                  Data: { Hint: 'Email' }
                },
                LoginPassword: {
                  Type: 'weEdit',
                  L: 0,
                  T: 40,
                  R: 0,
                  Data: {
                    Hint: 'Password',
                    Password: true
                  }
                },
                LoginBtn: {
                  Type: 'weButton',
                  L: 1,
                  T: 95,
                  R: -1,
                  Data: {
                    Text: 'Login',
                    Default: true
                  },
                  Events: {
                    OnClick: function (e) {
                      LoginUser();
                      return true;
                    }
                  }
                },
                NewUserBtn: {
                  Type: 'weLink',
                  L: 1,
                  T: 147,
                  ColorScheme: 'White',
                  Data: { Text: 'Register new user' },
                  Events: {
                    OnClick: function (e) {
                      AppForm.AppPages.SetPage(1);
                      var email = AppForm.LoginEmail.GetText();
                      if (email != '')
                        AppForm.RegisterEmail.SetText(email);
                      AppForm.RegisterPassword.SetText('');
                      AppForm.RegisterPassword2.SetText('');
                      AppForm.RegisterEmail.SetInvalid(false);
                      AppForm.RegisterPassword.SetInvalid(false);
                      AppForm.RegisterPassword2.SetInvalid(false);
                      AppForm.RegisterError.SetVisible(false);
                      return true;
                    }
                  }
                },
                LoginError: {
                  Type: 'weText',
                  L: 0,
                  T: 199,
                  R: 0,
                  ColorScheme: 'Yellow',
                  Data: {
                    Text: 'LoginError',
                    Visible: false
                  }
                }
              }
            }
          }
        },
        {
          Text: 'Registration Page',
          Controls: {
            CancelRegister: {
              Type: 'weAppButton',
              L: 20,
              T: 20,
              Data: {
                Img: 'Back',
                Visible: true,
                Alt: 'Back'
              },
              Events: {
                OnClick: function (e) {
                  AppForm.LoginError.SetVisible(false);
                  AppForm.AppPages.SetPage(0);
                  return true;
                }
              }
            },
            RegisterPanel: {
              Type: 'ngPanel',
              L: '50%',
              T: 73,
              W: 280,
              H: 320,
              style: { marginLeft: '-140px' },
              Controls: {
                RegisterEmail: {
                  Type: 'weEdit',
                  L: 0,
                  T: 0,
                  R: 0,
                  Data: { Hint: 'Email' }
                },
                RegisterPassword: {
                  Type: 'weEdit',
                  L: 0,
                  T: 52,
                  R: 0,
                  Data: {
                    Hint: 'Password',
                    Password: true
                  }
                },
                RegisterPassword2: {
                  Type: 'weEdit',
                  L: 0,
                  T: 91,
                  R: 0,
                  Data: {
                    Hint: 'Re-type password',
                    Password: true
                  }
                },
                RegisterBtn: {
                  Type: 'weButton',
                  L: 0,
                  T: 143,
                  R: 0,
                  Data: { Text: 'Register' },
                  Events: {
                    OnClick: function (e) {
                      RegisterUser();
                      return true;
                    }
                  }
                },
                RegisterError: {
                  Type: 'weText',
                  L: 0,
                  T: 207,
                  R: 0,
                  ColorScheme: 'Yellow',
                  Data: {
                    Text: 'RegisterError',
                    Visible: false
                  }
                }
              }
            },
            weCaption1: {
              Type: 'weCaption',
              L: 65,
              T: 23,
              ColorScheme: 'White',
              Data: { Text: 'Register New User' }
            }
          }
        },
        {
          Text: 'Chat Page',
          Controls: {
            ChatPanel: {
              Type: 'ngPanel',
              L: 0,
              R: 0,
              T: 0,
              B: 0,
              Controls: {
                Line: {
                  Type: 'weEdit',
                  L: '20%',
                  R: 65,
                  B: 20,
                  Data: { Hint: 'type something...' }
                },
                HistoryPanel: {
                  Type: 'ngPanel',
                  L: 0,
                  R: 0,
                  B: 72,
                  T: 20,
                  ScrollBars: ssAuto,
                  OnCreated: function (c, ref) {
                    var o = c.Elm();
                    if (o) {
                      o.onscroll = ngAddEvent(o.onscroll, function (e) {
                        var scrollBottom = o.scrollHeight - (o.scrollTop + o.clientHeight);
                        AppForm.History.FollowTail = scrollBottom < 10;
                      });
                    }
                  },
                  Controls: {
                    History: {
                      Type: 'ngToolBar',
                      ParentReferences: false,
                      L: 0,
                      R: 0,
                      B: 0,
                      Data: {
                        AutoSize: true,
                        VPadding: 10
                      },
                      Controls: {},
                      Events: {
                        OnUpdated: function (c, o) {
                          var h = ng_OuterHeight(o);
                          var hp = AppForm.HistoryPanel.Elm();
                          if (hp) {
                            var hph = ng_ClientHeight(hp);
                            if (h <= hph) {
                              if (typeof AppForm.History.Bounds.T !== 'undefined') {
                                AppForm.History.SetBounds({
                                  B: 0,
                                  T: undefined
                                });
                                AppForm.History.Update();
                              }
                            } else {
                              if (typeof AppForm.History.Bounds.B !== 'undefined') {
                                AppForm.History.SetBounds({
                                  B: undefined,
                                  T: 0
                                });
                                AppForm.History.Update();
                                c.FollowTail = true;
                              }
                              if (c.FollowTail)
                                hp.scrollTop = h - hph;
                            }
                          }
                          return true;
                        }
                      }
                    }
                  }
                },
                SendButton: {
                  Type: 'weAppButton',
                  R: 20,
                  B: 20,
                  Data: {
                    Img: 'OK',
                    Default: true
                  },
                  Events: {
                    OnClick: function (e) {
                      var txt = ng_Trim(AppForm.Line.GetText());
                      if (txt != '') {
                        if (txt === 'whoishere')
                          SendStatus(chatUsers);
                        else
                          SendMessage(txt);
                        AppForm.Line.SetText('');
                        AppForm.Line.SetFocus();
                      }
                      return true;
                    }
                  }
                }
              }
            },
            Channel: {
              Type: 'synergykitSpeak',
              L: 20,
              T: 6,
              Data: {
                SpeakName: 'ChatChannel',
                ListenSpeak: false
              },
              Events: {
                OnSpeak: function (c, msg) {
                  try {
                    ProcessMessage(msg);
                  } catch (e) {
                  }
                }
              }
            }
          }
        }
      ]
    },
    AboutPanel: {
      Type: 'weColorPanel',
      L: 0,
      T: 60,
      R: 0,
      B: 0,
      ColorScheme: 'Gray',
      style: {
        zIndex: 1000
      },
      Data: {
        Visible: false
      },
      Controls: {
        AboutPanelContent: {
          Type: 'ngPanel',
          L: 0, T: 0, R: 0, B: 0,
          Controls: {
            AboutCaption: {
              Type: 'weCaption',
              L: 20,
              T: 20,
              ColorScheme: 'White',
              Data: { Text: 'About' }
            },
            AboutTexts: {
              Type: 'ngToolBar',
              L: 20,
              T: 63,
              R: 20,
              B: 20,
              ScrollBars: ssAuto,
              Controls: {
                AboutDescription: {
                  Type: 'weText',
                  L: 0,
                  R: 0,
                  Data: { Text: 'This is real-time communication demo.<br />The main purpose of this application is to demonstrate integration of SynergyKit and Controls.js.<br />&nbsp;<br />Source code:' }
                },
                AboutSourcesLink: {
                  Type: 'weLink',
                  ColorScheme: 'LtGray',
                  Data: { Text: 'github.com/controlsjs/synergykit-letschat' },
                  Events: {
                    OnClick: function (e) {
                      window.open('https://github.com/controlsjs/synergykit-letschat', 'GITHUB');
                      return true;
                    }
                  }
                },
                AboutSynergyKit: {
                  Type: 'weText',
                  L: 0,
                  R: 0,
                  Data: { Text: 'SynergyKit is Backend as a Service for fast and simple mobile/web/desktop applications development.' }
                },
                AboutSynergyKitLink: {
                  Type: 'weLink',
                  ColorScheme: 'LtGray',
                  Data: { Text: 'www.synergykit.com' },
                  Events: {
                    OnClick: function (e) {
                      window.open('http://www.synergykit.com', 'SYNERGYKIT');
                      return true;
                    }
                  }
                },
                AboutControlsJS: {
                  Type: 'weText',
                  L: 0,
                  R: 0,
                  Theme: WE_DARK,
                  Data: { Text: 'Controls.js is a technology for building modern web and mobile applications, while providing the same user experience as standard desktop or native applications.' }
                },
                AboutControlsJSLink: {
                  Type: 'weLink',
                  ColorScheme: 'LtGray',
                  Data: { Text: 'controlsjs.com' },
                  Events: {
                    OnClick: function (e) {
                      window.open('http://controlsjs.com', 'CONTROLSJS');
                      return true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    Footer: {
      Type: 'weColorPanel',
      L: 0,
      H: 40,
      R: 0,
      B: 0,
      ColorScheme: 'DkGray',
      Controls: {
        ControlsJSLink: {
          Type: 'weLink',
          L: 20,
          T: 4,
          ColorScheme: 'White',
          style: { fontSize: '10px' },
          Data: { Text: 'http://controlsjs.com' },
          Events: {
            OnClick: function (e) {
              window.open('http://controlsjs.com', 'CONTROLSJS');
              return true;
            }
          }
        },
        UserEmail: {
          Type: 'weLink',
          L: 129,
          T: 4,
          R: 20,
          ColorScheme: 'White',
          Data: {
            Text: 'UserEmail',
            TextAlign: 'right',
            Visible: false
          },
          Events: {
            OnClick: function (e) {
              ngMessageDlg('weDlgMessageBox', 'Logout?', 'ngAppName', function (c) {
                if (c.DialogResult == mbYes) {
                  AppForm.Channel.SetListenSpeak(false);
                  AppForm.LoginEmail.SetText('');
                  AppForm.LoginPassword.SetText('');
                  AppForm.History.Controls.Dispose();
                  AppForm.UserEmail.SetVisible(false);
                  AppForm.AppPages.SetPage(0);
                }
                return true;
              }, { DlgButtons: mbYes | mbNo | mbDefButton2 });
              return true;
            }
          }
        }
      }
    }
  });

  // Handle device types
  UpdateLayout(ngDevice);  
  ngApp.AddEvent('OnDeviceChanged',DeviceChanged);

  AppForm.Update();
  AppForm.AppPages.SetPage(0);
}

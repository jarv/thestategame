function shuffle(array) {
    var tmp, current, top = array.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    return array;
}

function toFixed(value, precision) {
    precision = precision || 0,
        neg = value < 0,
        power = Math.pow(10, precision),
        value = Math.round(value * power),
        integral = String((neg ? Math.ceil : Math.floor)(value / power)),
        fraction = String((neg ? -value : value) % power),
        padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');

    return precision ? integral + '.' +  padding + fraction : integral;
}

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
            obj = obj.offsetParent;
        } while (obj);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
    var s = ((r << 16) | (g << 8) | b).toString(16);
    while (s.length<6) {
      s = '0' + s;
    }
    return '0x' + s;
}

var game = {

  start: function() {
    // constructor for the game object,
    //  - setup event listeners,
    //  - initiate the canvas and ctx

    // load the map
    var map_img = new Image();
    map_img.src = 'us_map3.png';
    var map_states_img = new Image();
    map_states_img.src = 'us_map3_states.png';
    var map_states_test_img = new Image();
    map_states_test_img.src = 'us_map3_states_test.png';
    // load the state images
    var state_img = new Image();
    state_img.src='seals/all_33.png';
    var splash_img = new Image();
    splash_img.src='screenshot.png';
    // ok this is ridiculous but i'm lazy
    $(splash_img).one('load', function() {
       $(state_img).one('load', function() {
          $(map_states_img).one('load', function() {
            $(map_img).one('load', function() {
                $(map_states_test_img).one('load', function() {
                    init();                  
                }).each(function() { 
                  if(this.complete) $(this).load();});
            }).each(function() { 
              if(this.complete) $(this).load();});
          }).each(function() { 
            if(this.complete) $(this).load();});
       }).each(function() { 
         if(this.complete) $(this).load();});
    }).each(function() { 
      if(this.complete) $(this).load();});

    function init() {
      $('#loading').hide();
      game.c  = $('#map')[0];
      game.ctx  = game.c.getContext('2d');
      game.t = $('#test')[0];
      game.ctx_t = game.t.getContext('2d');

      game.round_time = 20;  // seconds per round
      // placements of states
      // when round starts

      game.placement = {};
      game.placement[1] = [{'x':350,'y':60}];
      game.placement[2] = [{'x':217,'y':60},{'x':433,'y':60}];
      game.placement[3] = [{'x':163,'y':60},{'x':325,'y':60},{'x':489,'y':60}];

      game.image = {};
      game.image.state = state_img;
      game.image.map = map_img;
      game.image.map_states = map_states_img;
      game.image.map_states_test = map_states_test_img;
      game.image.splash = splash_img;

      // load the custom fonts and draw
      // the intro screen

      WebFontConfig = {
        google: { families: [ 
            'Averia+Libre::latin',
                    'Frijole', 'Sunshiney::latin'] },
        active: function() {
        /* code to execute once all font families are loaded */
          game.drawIntro();
        }
      };

      (function() {
        var wf = document.createElement('script');
        wf.src = ('https:'==document.location.protocol ? 'https' : 'http') +
          '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
      })(); 

      // setInterval(game.rotate, 10);
      // setDeceleratingTimeout( game.rotate, .1, 100 );

    } 
  },
  rotate: function() {
    // canvas: 700x700
    // us_map3.png 570x500
    // midpoint 300x215
    // xoffset: 65 yoffset: 100
    if (game.rot_target === 0 ) {
      game.ctx.drawImage(game.image.map,65,100);
      $.each(game.state_list, function(i,v) {
        if (v.queued || v.selected) {
          var s = game.state_select[v.name];
          game.ctx.drawImage(game.image.map_states,
            s.offset,0,s.w,s.h,
            65+s.x,100+s.y,s.w,s.h);
        }
      });
      return;
    } else if (game.rot <= game.rot_target) {
      game.rot += 0.1;
    } 

    game.ctx.save();
    var m_center = [350, 350];
    game.ctx.clearRect(0, 0, game.c.width, game.c.height);
    // center the map on the canvas
    game.ctx.translate(m_center[0], m_center[1]);
    game.ctx.rotate(game.rot);
    game.ctx.drawImage(game.image.map,-285,-250);
    // draw selected overlay
    $.each(game.state_list, function(i,v) {
      if (v.queued || v.selected) {
        var s = game.state_select[v.name];
        game.ctx.drawImage(game.image.map_states,
          s.offset,0,s.w,s.h,
          s.x-285,s.y-250,s.w,s.h);
      }
    }); 
    game.ctx.restore();
  },

  // end rotate

  checkClick: function(e) {
    // this will display the test canvas
    // over the map and check each displayed
    // state 
    var pos = findPos(game.c);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;
    // only care about states that are on the board
    var state_list = game.state_list;
    //var state_list = game.state_list.filter( function(v) {
    //  if (!v.selected) {
    //    return v;
    //  }
    //});

    //check to see if they user clicked a state
    //first - for now this commented out to 
    //allow click-throughs

    //for (var i=0; i<state_list.length; i++) {
    //  v = state_list[i];
    //  var dist = Math.sqrt(Math.pow(x-v.x,2)
    //    + Math.pow(y-v.y,2));
    //  if (dist <= v.radius) {
    //    return;
    //  }
    //}


    // make sure they are clicking the map
    //var p = game.ctx.getImageData(x, y, 1, 1).data; 
    //if (p[0]==255 && p[1]==255 && p[2]==255 ||
    //    p[0]==0 && p[1]==0 && p[2]==0) {
    //    return;
    //}


    // now use the test canvas to
    // check which state was 
    // clicked
    var got = false;
    var m_center = [350,350];
    game.ctx_t.save();
    game.ctx_t.translate(m_center[0],m_center[1]);
    game.ctx_t.rotate(game.rot);  
    for (var i=0; i<game.state_list.length; i++) {
      var v = game.state_list[i];
      //if (v.queued) {
      // continue;
      //}
      var s = game.state_select_test[v.name];
      game.ctx_t.clearRect(-285, -250, game.t.width, game.t.height);
      game.ctx_t.drawImage(game.image.map_states_test,
        s.offset,0,s.w,s.h,
        s.x-285, s.y-250,s.w,s.h);

      // show and hide very quick to get
      // the pixel under the cursor */
      $('#test').show();
      var tp = game.ctx_t.getImageData(x, y, 1, 1).data; 
      $('#test').hide();
      if ( tp[0]==255 && tp[1]==255 && tp[2] == 255) {
        if (v.queued || v.selected) {
          got = true;
          break;
        } else {
          // match, add state to the selected list
          game.points = game.points + (v.points * game.bonus);
          v.queued = true;
          got = true;
          break;
        }
      }
    }
    game.ctx_t.restore();
    if (! got) {
      game.createMsg('wrong state','error');
      game.miss++;
      // any state that's not in motion
      // will start moving
      $.each(state_list, function(i,v) {
        if (v.vx === 0 && v.vy === 0) {
          var speed = Math.floor(Math.random()*3) + 4;
          var angle = Math.floor(Math.random()*360) * Math.PI / 180;
          v.vx = Math.cos(angle) * speed;
          v.vy = Math.sin(angle) * speed;
          if (v.queued) {
              window.setTimeout(function() { 
                v.selected = true;
              }, 1000);
          }
        }
      });

    }
  },

  startRound: function() {
    // game.num_states is the number of states
    //   to display on the screen at a time

    if (game.round <=  5 ) {
        game.num_states=1;
        game.rot_target=0;
    } else if (game.round <= 11 ) {
        game.num_states=2;
        game.rot_target=Math.PI;
    } else if (game.round <= 22) {
        game.num_states=3;
        game.rot_target=2*Math.PI;
    } else {
      game.drawGameOver();
      return;
    }
    // any stationary unselected states that 
    // are left on the board will
    // be put into motion
    $.each(game.state_list, function(i,v) {
      if (!v.selected) {
        if (v.vx === 0 && v.vy === 0) {
          var speed = Math.floor(Math.random()*3) + 4;
          var angle = Math.floor(Math.random()*360) * Math.PI / 180;
          v.vx = Math.cos(angle) * speed;
          v.vy = Math.sin(angle) * speed;
        }
      }
    });

    // we will wait for 
    // slots to be available and place
    // them there
    var p = game.placement[game.num_states];
    for (var num=0; num<p.length; num++) {
      // if the distance to where we want to
      // place to a moving state is less than
      // the sum of the radii then we need to 
      // keep trying

      for (var i=0; i<game.state_list.length; i++) {
        state = game.state_list[i];
        if (state.selected) {
           continue;
        } 
        for (var j=0; j<game.num_states; j++) {
          var dist = Math.sqrt(Math.pow(p[j].x-state.x,2) + 
            Math.pow(p[j].y-state.y,2));
          if (dist <= 2*state.radius) {
           // wait a little bit and check again
           game.timeout_cnt++;
           if (game.timeout_cnt > 100) {
             // if 10 seconds go by
             // draw the game over screen
             game.drawGameOver();
           } else {
             window.setTimeout(game.startRound,100);
           }
           return;
          } 
        }
      }
    }
    // reset the timeout counter
    game.timeout_cnt = 0;
    game.createMsg('Round '+game.round, 'info');


    // set states in motion that
    // have not been selected and
    // are stationary

    $.each(game.states_shuf.slice(game.state_cnt, 
            game.state_cnt+game.num_states), function(i,v) {
      // states will start stationary
      var speed = 0;
      // zero deg---> (counter clockwise)
      var angle = Math.floor(Math.random()*360) * Math.PI / 180;
      //var speed = Math.floor(Math.random()*3) + 2;
      var vx = Math.cos(angle) * speed;
      var vy = Math.sin(angle) * speed;
      var img = game.image[v];
      var radius = 60;
      var imgw = 120;
      var imgh = 120;
      var mass = 10;
      var points = 1;
      var x = game.placement[game.num_states][i].x;
      var y = game.placement[game.num_states][i].y;
      game.state_list.push( {'name':v,'vx':vx, 
                        'vy':vy, 'x':x,
                        'y':y, 'img':img, 'imgw':imgw, 'imgh':imgh,
                        'radius':radius, 'mass':mass, 'nextx':x, 
                        'nexty':y, 'selected':false, 'alpha':1,
                        'points':points});
    });
    // keep track of the selected states
    // for each turn
    $('#map').off("click");
    // check for a click on any state
    // in the selection list
    $('#map').on("click", function(e){ 
      game.checkClick(e);
    });
    // check for a mouse move for dragging
    var t = new Date().getTime() / 100;
    game.start_round_time = Math.floor(t) / 10;
    game.round_time_left = game.round_time;
    game.miss = 0;
    game.roundover = false; //go! 
  },

  drawMap: function() {
    //clear the canvas
    game.ctx.clearRect(0, 0, game.c.width, game.c.height);
    game.ctx.globalAlpha = 1;
    // draw the map and the states
    // draw selected overlay

    game.rotate();
    game.updateStates();
    if (!game.roundover) {
      var t = new Date().getTime() / 100;
      var cur_time = (Math.floor(t) / 10);
      game.time = cur_time - game.start_time;
      game.round_time_left = game.round_time - 
        (cur_time - game.start_round_time );
    }
    var bonus = 0;
    if (game.miss === 0 ) {
      bonus = game.round * Math.ceil(game.round_time_left);
    } else {
      bonus = (game.round - game.miss) * Math.ceil(game.round_time_left);
      if (bonus < 0) {
        bonus = 0;
      }
    }

    // display how many seconds are 
    // left for the round
    game.ctx.globalAlpha = 1;
    game.ctx.font = "normal 18px 'Averia Libre'";
    game.ctx.fillStyle = "#0000A0";
    game.ctx.fillText("Time Elapsed: " + toFixed(game.time, 1), 110,650);

    game.ctx.font = "normal 18px 'Averia Libre'";
    game.ctx.fillStyle = "#0000A0";
    game.ctx.fillText("Bonus Pool: " + bonus,450,650);

    // display how many points
    // are earned so far

    game.ctx.font = "normal 48px 'Averia Libre'";
    game.ctx.fileStyle = "#0000FF";
    var txt = "Points: " + game.points;
    var w = game.ctx.measureText(txt).width;
    game.ctx.fillText(txt,90,620);


    game.ctx.font = "normal 48px 'Averia Libre'";
    game.ctx.fileStyle = "#0000FF";
    txt = "Bonus: x" + game.bonus;
    w = game.ctx.measureText(txt).width;
    game.ctx.fillText(txt, 400,620);


    //display msgs if any exist in the msg queue

    $.each(game.msg_queue, function(i,v) {
      if (v.opacity <= 0) {
        return;
      }
      game.ctx.fillStyle = "rgba(" + v.color + "," + v.opacity + ")";
      game.ctx.font = "normal " + v.px + "px" + " " + "'" + v.font + "'";
      var w = game.ctx.measureText(v.txt).width;
      game.ctx.fillText(v.txt,(game.c.width-w)/2, v.ypos);
      v.opacity = (v.opacity<0)? 0: (v.opacity - v.opacity_scale);
    });

    // check for gameover

    var states_left = game.state_list.filter( function(v) {
      if (!v.selected) {
        return v;
      }
    }).length;

    if (  !game.roundover && 
        ( game.round_time_left <= 0 || states_left === 0) ) {
      // all states have been selected,
      // or we are out of time for this round,
      // advance to the next one. 
      game.roundover = true;
      // bonus 
      if (bonus > 0) {
        if ( game.miss === 0) {
          game.createMsg("Perfect Round - Bonus +" + 
                                    bonus + "!", 'perfect');
        } else {
          game.msg_queue.push(
              game.createMsg("Bonus +" + bonus, 'time'));
        }
        game.bonus += bonus;
      }
      game.round++;
      game.state_cnt += game.num_states;
      window.setTimeout(function() {
        game.startRound();
      }, 500);
    }
    setTimeout(game.drawMap, 30);
  },

  updateStates: function() {
    // only update states that have
    // not been selected
    // this includes states that are
    // queued for removal

    var state_list = game.state_list.filter( function(v) {
      if (!v.selected) {
        return v;
      }
    });


    $.each(state_list, function(i,v) {
      v.nextx = (v.x += v.vx);
      v.nexty = (v.y += v.vy); 
      // check for edge collisions
      if (v.nextx+v.radius >= game.c.width ) {
        v.vx = -v.vx;
        v.nextx = game.c.width - v.radius;
      } else if ( v.nextx-v.radius < 0 ) {
        v.vx = -v.vx;
        v.nextx = v.radius;
      } else if (v.nexty+v.radius > game.c.height ) {
        v.vy = -v.vy;
        v.nexty = game.c.height - v.radius;
      } else if (v.nexty-v.radius < 0 ) {
        v.vy = -v.vy;
        v.nexty = v.radius;
      }
    });

    // check for collisions 
    for (var i=0; i<state_list.length; i++) {
      var state = state_list[i];
      for (var j=i+1; j< state_list.length; j++) {
        var test_state = state_list[j];
        if (test_state.selected) {
          continue;
        } 
        // check if the distance between the midpoints is less than
        // the sum of the two radii
        var dx = state.nextx - test_state.nextx;
        var dy = state.nexty - test_state.nexty;
        if (Math.pow(dx,2) + Math.pow(dy,2) <= 
            Math.pow(test_state.radius + state.radius,2)) {
          collide(state,test_state);
        }
      }
    }
    draw();

    // only functions below this line

    function draw() {
      // draw the states
      $.each(state_list, function(i,v) {
        if (v.queued)  {
          // fade out
          if (v.alpha > 0) {
            v.alpha -= 0.2;
          } else {
            v.selected = true;
          }
        }
        v.x = v.nextx;
        v.y = v.nexty;
        // draw the State
        game.ctx.globalAlpha = (v.alpha < 0)?0:v.alpha;
        var sx = game.states.indexOf(v.name) * v.imgw;
        game.ctx.drawImage(game.image.state,
            sx,0,120,120,
            v.x-v.radius,v.y-v.radius,120,120);
        // draw the circle
        game.ctx.strokeStyle = "#0000A0";
        game.ctx.beginPath();
        game.ctx.arc(v.x,v.y,v.radius,0,2*Math.PI,true);
        game.ctx.stroke();
        game.ctx.closePath();


        // draw the state abbrev
        game.ctx.font = "normal 55px 'Frijole'";
        game.ctx.fillStyle = "#0000A0";
        var w = game.ctx.measureText(v.name).width;
        var vx = v.x - w/2;
        var vy = v.y + v.radius - 45;
        game.ctx.fillText(v.name, vx, vy);
    

        // draw the long names
        var ln = game.long_names[v.name];
        game.ctx.font = "normal 24px 'Sunshiney'";
        game.ctx.fillStyle = "#000000";
        var wl = game.ctx.measureText(ln).width;
        lnx = v.x - wl/2;
        lny = v.y + v.radius - 20;

        game.ctx.fillText(ln, lnx, lny);  
        }); 
    }
    
    function collide(state, test_state) {
      //get the collision angle
      var dx = state.nextx - test_state.nextx;
      var dy = state.nexty - test_state.nexty;
      var angle = Math.atan2(dy,dx);
      var speed_state = Math.sqrt( Math.pow(state.vx,2) + 
          Math.pow(state.vy,2));
      var speed_test = Math.sqrt( Math.pow(test_state.vx,2) + 
          Math.pow(test_state.vy,2));
      var dir_state = Math.atan2(state.vy,state.vx);
      var dir_test = Math.atan2(test_state.vy, test_state.vx);

      var vel_statex = speed_state * Math.cos(dir_state-angle);
      var vel_statey = speed_state * Math.sin(dir_state-angle);
      var vel_testx = speed_test * Math.cos(dir_test-angle);
      var vel_testy = speed_test * Math.sin(dir_test-angle);

      var final_vel_statex = ((state.mass - test_state.mass) * vel_statex +
        (test_state.mass + test_state.mass) * vel_testx)/(state.mass+test_state.mass);
      var final_vel_testx =  ((state.mass + state.mass) * vel_statex +
        (test_state.mass - state.mass) * vel_testx)/(state.mass + test_state.mass);
      var final_vel_statey = vel_statey;
      var final_vel_testy = vel_testy;

      state.vx = Math.cos(angle) * final_vel_statex +
        Math.cos(angle + Math.PI/2) * final_vel_statey;
      state.vy = Math.sin(angle) * final_vel_statex +
        Math.sin(angle + Math.PI/2) * final_vel_statey;
      test_state.vx = Math.cos(angle) * final_vel_testx +
        Math.cos(angle + Math.PI/2) * final_vel_testy;
      test_state.vy = Math.sin(angle) * final_vel_testx +
        Math.sin(angle + Math.PI/2) * final_vel_testy;

      state.nextx = ( state.nextx += state.vx);
      state.nexty = ( state.nexty += state.vy);
      test_state.nextx = ( test_state.nextx += test_state.vx);
      test_state.nexty = ( test_state.nexty += test_state.vy);
    }

  },


  drawGameOver: function() {
    // canvas: 700x700
    // us_map3.png 570x500
    // midpoint 300x215
    // xoffset: 65 yoffset: 100
    $('#map').off('click');
    $('#hs').show();
    var submitted = false;
    updateHS();

    function updateHS() {
      $.ajax({
          url: '/d',
          cache: 'false',
          dataType: 'json',
          type: 'get',
          async: 'false',
          success: function(data) {
            var min = Math.min.apply(Math,
                    data.map( function(v) {return v.score;}));
            if (!submitted && ( data.length<10 || game.points > min)) {
              newHS();
            }
            // display highscore
            var hs = [];
            $.each(data, function(i,v) {
              hs.push('<tr><td>' + v.name + '</td>' + 
                      '<td>' + v.score + '</td>' +
                      '<td>' + v.time + '</td></tr>'); 
            });
            var h = '<tr class="yellow"><td>name</td><td>score</td><td>time</td></tr>';
            $('#hstable').html('<table>' + h + hs.join('') + '</table>');
          },
          error: function () {
              alert("server error");
          }
      });
    }

    function newHS() {
      $('#input').keydown( function(e) {
        if ($('#input').val().length >= 2) {
          $('#response').html('<span style="color:green">Press Enter to Submit</span>');
        } else {
          $('#response').html('');
        }
        if (e.keyCode == 13 && $('#input').val().length >= 3 ) {
          $('#input').prop("disabled", true);
          n = $('#input').val();
          $.ajax({
                  url: '/d',
                  cache: 'false',
                  dataType: 'json',
                  type: 'post',
                  async: 'false',
                  data:{'name':n,'score':game.points,
                    'time':toFixed(game.time,1)},
                  success: function(data) {
                    // display highscore
                    if (data.ok) {
                      submitted = true;
                      $('#newhs').hide();
                      updateHS();
                    } else if (data.error) {
                      $('#response').html('<span style="color:red">' + 
                        data.error + '</span>');
                        $('#input').prop("disabled", false);
                    } 
                  },
                  error: function () {
                    alert("server error");
                  }
              });
        }
      });
      $('#newhs').show();
    }
  },
  drawIntro: function() {

    function fillText_center(txt,y) {
      var w = game.ctx.measureText(txt).width;
      game.ctx.fillText(txt, (game.c.width-w)/2,y);
    }

    game.ctx.drawImage(game.image.splash,135,250);
    game.ctx.font = "normal 48px 'Sunshiney'";
    game.ctx.fillStyle = "#000000";
    fillText_center("Welcome to the State Game", 50);
    fillText_center("Click states on the map as the names",100);
    fillText_center("appear on the screen.",150);
    fillText_center("(click anywhere to begin)", 210);
    $('#map').on("click", function(e) {
      setTimeout(game.drawMap, 30);
      var t = new Date().getTime()/100;
      game.start_time = Math.floor(t) / 10;
      game.time = 0;
      game.round_time_left = 0;  
      game.state_list = [];
      game.roundover = true;
      game.round = 1;
      game.points = 0;
      game.states_shuf = shuffle(game.states);  // shuffle the pool
      game.state_cnt = 0;
      game.num_states = 0;
      game.bonus = 1;
      game.rot = 0;
      game.rot_target = 0;
      game.msg_queue = []; 
      game.timeout_cnt = 0;
      game.startRound();
      });
  },

  createMsg: function(txt,type) {
    msg = {};
    msg.txt = txt;
    msg.opacity_scale = 0.08;
    msg.font = 'Averia Libre';
    switch (type) {
      case 'info':
        msg.px = 68;
        msg.ypos = 120;
        msg.color = "0,0,255";
        msg.opacity_scale = 0.03;
        break;
      case 'error':
        msg.px = 48;
        msg.ypos = 580;
        msg.color = "255,0,0";
    msg.opacity_scale = 0.06;
        break;
      case 'perfect':
        msg.px = 48;
        msg.ypos = 570;
        msg.color = "6,126,6";
        msg.opacity_scale = 0.01;
        break;
      case 'time':
        msg.px = 48;
        msg.ypos = 570;
        msg.color = "6,126,6";
        msg.opacity_scale = 0.01;
        break;
      default:
    }
    // will display as soon as 
    // opacity is set
    msg.opacity = 1;
    // clean up any msgs that have
    // already been displayed
    game.msg_queue = game.msg_queue.filter( function(item) {
      if ( item.opacity > 0 ) {
        return item;
      } 
    });
    game.msg_queue.push(msg);
  },

  states: [
    "AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA","ID",
    "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI",
    "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY",
    "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN",
    "TX", "UT", "VA", "VT", "WA", "WI",  "WV", "WY"  
  ],

  state_select_test: {
'AK': {'x':82, 'y':295, 'w':87, 'h':112, 'offset':0},
'AL': {'x':382, 'y':232, 'w':39, 'h':66, 'offset':87},
'AR': {'x':310, 'y':218, 'w':50, 'h':47, 'offset':126},
'AZ': {'x':80, 'y':194, 'w':71, 'h':84, 'offset':176},
'CA': {'x':7, 'y':99, 'w':83, 'h':149, 'offset':247},
'CO': {'x':153, 'y':150, 'w':77, 'h':59, 'offset':330},
'CT': {'x':393, 'y':107, 'w':141, 'h':277, 'offset':407},
'DE': {'x':355, 'y':149, 'w':164, 'h':338, 'offset':548},
'FL': {'x':394, 'y':282, 'w':96, 'h':71, 'offset':712},
'GA': {'x':410, 'y':229, 'w':56, 'h':57, 'offset':808},
'HI': {'x':271, 'y':417, 'w':15, 'h':22, 'offset':864},
'IA': {'x':289, 'y':123, 'w':62, 'h':40, 'offset':879},
'ID': {'x':85, 'y':27, 'w':62, 'h':104, 'offset':941},
'IL': {'x':341, 'y':134, 'w':41, 'h':73, 'offset':1003},
'IN': {'x':380, 'y':141, 'w':30, 'h':53, 'offset':1044},
'KS': {'x':230, 'y':170, 'w':77, 'h':41, 'offset':1074},
'KY': {'x':368, 'y':175, 'w':74, 'h':39, 'offset':1151},
'LA': {'x':318, 'y':266, 'w':59, 'h':51, 'offset':1225},
'MA': {'x':392, 'y':94, 'w':159, 'h':256, 'offset':1284},
'MD': {'x':332, 'y':148, 'w':180, 'h':329, 'offset':1443},
'ME': {'x':528, 'y':27, 'w':36, 'h':59, 'offset':1623},
'MI': {'x':348, 'y':69, 'w':78, 'h':72, 'offset':1659},
'MN': {'x':283, 'y':50, 'w':63, 'h':73, 'offset':1737},
'MO': {'x':296, 'y':164, 'w':71, 'h':59, 'offset':1800},
'MS': {'x':347, 'y':236, 'w':36, 'h':66, 'offset':1871},
'MT': {'x':113, 'y':29, 'w':106, 'h':71, 'offset':1907},
'NC': {'x':424, 'y':191, 'w':91, 'h':40, 'offset':2013},
'ND': {'x':218, 'y':47, 'w':68, 'h':43, 'offset':2104},
'NE': {'x':212, 'y':129, 'w':86, 'h':42, 'offset':2172},
'NH': {'x':406, 'y':62, 'w':132, 'h':262, 'offset':2258},
'NJ': {'x':365, 'y':124, 'w':152, 'h':330, 'offset':2390},
'NM': {'x':144, 'y':204, 'w':73, 'h':75, 'offset':2542},
'NV': {'x':44, 'y':113, 'w':68, 'h':103, 'offset':2615},
'NY': {'x':322, 'y':72, 'w':204, 'h':324, 'offset':2683},
'OH': {'x':407, 'y':131, 'w':44, 'h':48, 'offset':2887},
'OK': {'x':219, 'y':211, 'w':92, 'h':45, 'offset':2931},
'OR': {'x':15, 'y':45, 'w':84, 'h':73, 'offset':3023},
'PA': {'x':318, 'y':118, 'w':190, 'h':326, 'offset':3107},
'RI': {'x':424, 'y':98, 'w':122, 'h':271, 'offset':3297},
'SC': {'x':437, 'y':222, 'w':51, 'h':39, 'offset':3419},
'SD': {'x':214, 'y':89, 'w':73, 'h':46, 'offset':3470},
'TN': {'x':360, 'y':204, 'w':89, 'h':31, 'offset':3543},
'TX': {'x':172, 'y':217, 'w':151, 'h':145, 'offset':3632},
'UT': {'x':100, 'y':127, 'w':59, 'h':75, 'offset':3783},
'VA': {'x':434, 'y':160, 'w':75, 'h':44, 'offset':3842},
'VT': {'x':386, 'y':68, 'w':137, 'h':259, 'offset':3917},
'WA': {'x':36, 'y':11, 'w':70, 'h':53, 'offset':4054},
'WI': {'x':323, 'y':78, 'w':52, 'h':56, 'offset':4124},
'WV': {'x':437, 'y':156, 'w':45, 'h':37, 'offset':4176},
'WY': {'x':140, 'y':92, 'w':75, 'h':61, 'offset':4221}

  },   

  state_select: {
    'AK': {'x':82, 'y':295, 'w':87, 'h':112, 'offset':0},
    'AL': {'x':382, 'y':232, 'w':39, 'h':66, 'offset':87},
    'AR': {'x':310, 'y':218, 'w':50, 'h':47, 'offset':126},
    'AZ': {'x':80, 'y':194, 'w':71, 'h':84, 'offset':176},
    'CA': {'x':7, 'y':99, 'w':83, 'h':149, 'offset':247},
    'CO': {'x':153, 'y':150, 'w':77, 'h':59, 'offset':330},
    'CT': {'x':393, 'y':107, 'w':141, 'h':277, 'offset':407},
    'DE': {'x':367, 'y':155, 'w':146, 'h':320, 'offset':548},
    'FL': {'x':394, 'y':282, 'w':96, 'h':71, 'offset':694},
    'GA': {'x':410, 'y':229, 'w':56, 'h':57, 'offset':790},
    'HI': {'x':271, 'y':417, 'w':15, 'h':22, 'offset':846},
    'IA': {'x':289, 'y':123, 'w':62, 'h':40, 'offset':861},
    'ID': {'x':85, 'y':27, 'w':62, 'h':104, 'offset':923},
    'IL': {'x':341, 'y':134, 'w':41, 'h':73, 'offset':985},
    'IN': {'x':380, 'y':141, 'w':30, 'h':53, 'offset':1026},
    'KS': {'x':230, 'y':170, 'w':77, 'h':41, 'offset':1056},
    'KY': {'x':368, 'y':175, 'w':74, 'h':39, 'offset':1133},
    'LA': {'x':318, 'y':266, 'w':59, 'h':51, 'offset':1207},
    'MA': {'x':392, 'y':94, 'w':159, 'h':256, 'offset':1266},
    'MD': {'x':332, 'y':148, 'w':180, 'h':329, 'offset':1425},
    'ME': {'x':528, 'y':27, 'w':36, 'h':59, 'offset':1605},
    'MI': {'x':348, 'y':69, 'w':78, 'h':72, 'offset':1641},
    'MN': {'x':283, 'y':50, 'w':63, 'h':73, 'offset':1719},
    'MO': {'x':296, 'y':164, 'w':71, 'h':59, 'offset':1782},
    'MS': {'x':347, 'y':236, 'w':36, 'h':66, 'offset':1853},
    'MT': {'x':113, 'y':29, 'w':106, 'h':71, 'offset':1889},
    'NC': {'x':424, 'y':191, 'w':91, 'h':40, 'offset':1995},
    'ND': {'x':218, 'y':47, 'w':68, 'h':43, 'offset':2086},
    'NE': {'x':212, 'y':129, 'w':86, 'h':42, 'offset':2154},
    'NH': {'x':406, 'y':62, 'w':132, 'h':262, 'offset':2240},
    'NJ': {'x':365, 'y':124, 'w':152, 'h':330, 'offset':2372},
    'NM': {'x':144, 'y':204, 'w':73, 'h':75, 'offset':2524},
    'NV': {'x':44, 'y':113, 'w':68, 'h':103, 'offset':2597},
    'NY': {'x':322, 'y':72, 'w':204, 'h':324, 'offset':2665},
    'OH': {'x':407, 'y':131, 'w':44, 'h':48, 'offset':2869},
    'OK': {'x':219, 'y':211, 'w':92, 'h':45, 'offset':2913},
    'OR': {'x':15, 'y':45, 'w':84, 'h':73, 'offset':3005},
    'PA': {'x':318, 'y':118, 'w':190, 'h':326, 'offset':3089},
    'RI': {'x':432, 'y':106, 'w':106, 'h':255, 'offset':3279},
    'SC': {'x':437, 'y':222, 'w':51, 'h':39, 'offset':3385},
    'SD': {'x':214, 'y':89, 'w':73, 'h':46, 'offset':3436},
    'TN': {'x':360, 'y':204, 'w':89, 'h':31, 'offset':3509},
    'TX': {'x':172, 'y':217, 'w':151, 'h':145, 'offset':3598},
    'UT': {'x':100, 'y':127, 'w':59, 'h':75, 'offset':3749},
    'VA': {'x':434, 'y':160, 'w':75, 'h':44, 'offset':3808},
    'VT': {'x':386, 'y':68, 'w':137, 'h':259, 'offset':3883},
    'WA': {'x':36, 'y':11, 'w':70, 'h':53, 'offset':4020},
    'WI': {'x':323, 'y':78, 'w':52, 'h':56, 'offset':4090},
    'WV': {'x':437, 'y':156, 'w':45, 'h':37, 'offset':4142},
    'WY': {'x':140, 'y':92, 'w':75, 'h':61, 'offset':4187}
  },

  long_names: {
    "AK": "Alaska", "AL":"Alabama", "AZ":"Arizona", "AR":"Arkansas", 
    "CA":"California", "CO":"Colorado", "CT":"Connecticut", 
    "DE":"Delaware", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", 
    "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", 
    "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", 
    "LA":"Louisiana", "ME":"Maine", "MD":"Maryland", 
    "MA":"Massachusetts", "MI":"Michigan", 
    "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", 
    "MT":"Montana", "NE":"Nebraska", "NV":"Nevada", 
    "NH":"New Hampshire", "NJ":"New Jersey", "NM":"New Mexico", 
    "NY":"New York", "NC":"North Carolina", "ND":"North Dakota", 
    "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", 
    "PA":"Pennsylvannia", "RI":"Rhode Island", 
    "SC":"South Carolina", "SD":"South Dakota", 
    "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", 
    "VA":"Virginia", "WA":"Washington", "WV":"West Virginia", 
    "WI":"Wisconsin", "WY":"Wyoming", "wild": "Wild Card"
  }
};


$(document).ready(function() {
  game.start();
});

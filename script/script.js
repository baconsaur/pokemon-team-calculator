$.get("http://pokeapi.co/api/v1/pokedex/1", function(pokeData){
    var pokeTeam = [];
    var recent = 0;
    var pokemon = pokeData.pokemon;
    var input = $('#pokeSelect')
    var pName;
    var dexNum;
    var pType;
    var img;
    var removeText;
    var current = 0;
    var pokeSearch = [];
    var statNames = ['hp', 'attack', 'defense', 'sp_atk', 'sp_def', 'speed', 'total'];
    var statMax = [255, 180, 230, 180, 230, 180, 720]

    for(var i in pokemon) {
        if(pokemon[i].name.search(/(-(?!mi)[a-z]{4,})(-[a-z]{1,})?/) === -1)
          pokeSearch.push(pokemon[i].name);
    }

    $(input).autocomplete({
      source: function( request, response ) {
        var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
        response( $.grep( pokeSearch, function( item ){
            return matcher.test( item );
        }) );
      }
    });

    $(input).on('keypress', function(event){
      if (event.keyCode === 13)
        event.preventDefault();
        if (pokeTeam.length < 6 || !pokeTeam[recent])
          for (i in pokemon)
            if (input.val().toLowerCase() === pokemon[i].name){
              input.val('');
              $.get(("http://pokeapi.co/" + pokemon[i].resource_uri), function(pokemon){
                for (var i=0;i<=pokeTeam.length;i++)
                  if (!pokeTeam[i]){
                    pokeTeam[i] = pokemon;
                    recent = i;
                    break;
                  }
                getTargets();
                add(pokemon);
            });
          }
    });

  function add(pokemon){
    current++;
    $('.typeChart').show();
    $.get(("http://pokeapi.co/" + pokemon.sprites[0].resource_uri), function(sprite){
      img.empty();
      img.append('<img src="http://pokeapi.co/' + sprite.image + '">');
    });
    $('.slot' + (recent + 1)).hover(function(){
      var slotHover = '.sprite.slot' + (this.className.charAt(this.className.length-1));
      $(slotHover).css('background-color', '#CEF').css('border-radius', '20%');
    }, function(){
      var slotHover = '.sprite.slot' + (this.className.charAt(this.className.length-1));
      $(slotHover).css('background-color', '');
    });
    removeText.append('<a href="#">remove</a>');
    pName.append(pokemon.name);
    dexNum.append('#'+pokemon.national_id);
    pType.append(function(){
      var typeSprites = ''
      for (var i in pokemon.types){
        var typeName = pokemon.types[i].name;
        typeSprites += '<img src="images/' + typeName + '.png" alt="' + typeName + '" />'
      }
      return typeSprites;
    });
    addType(pokemon, 1);
  };

  $('.remove').on('click', function(){
    var parent = $(this).parent()[0].className;
    removePkmn(parent.charAt(parent.length-1), event);
  });

  $('.sprite').on('click', function(){
    var slot = this.className.charAt(this.className.length-1);
    if(pokeTeam[slot - 1])
      selectPokemon(slot);
  });

  function removePkmn(slot, event){
    current--;
    if (!current)
      $('.typeChart').hide();
    recent = slot - 1;
    var currentDisplay = $('.statList>h1');
    if(currentDisplay[0] && currentDisplay[0].innerText.substr(0, pokeTeam[recent].name.length) === pokeTeam[recent].name){
      $('.statList').hide('fast');
      $('.statList>ul').empty();
      $('.statList>h1').remove();
      $('#moveset').empty();
      $('#min>ul').empty();
      $('#max>ul').empty();
    }
    removeType(pokeTeam[recent]);
    pokeTeam[recent] = '';
    event.preventDefault();
    getTargets();
    img.empty();
    img.append('<img src="images/empty.png" alt="..." />');
    pName.empty();
    dexNum.empty();
    pType.empty();
    removeText.empty();
    $('.sprite.slot' + slot).css('background-color', '');
    $('.slot' + (recent + 1)).hover(function(){
      $('.sprite.slot' + slot).css('background-color', '');
    });
  };

  function getTargets(){
    img = $('.sprite.slot' + (recent + 1) + ">figure");
    pName = $('.stats.slot' + (recent + 1) + ">h1");
    dexNum = $('.stats.slot' + (recent + 1) + ">ul>li:first-child");
    pType = $('.stats.slot' + (recent + 1) + ">ul>li>figure");
    removeText = $('.stats.slot' + (recent + 1) + ">.remove");
  }

  function selectPokemon(slot){
    $('.statList').show('fast');
    $('.statList>ul').empty();
    $('.statList>h1').remove();
    $('#moveset').empty();
    $('.statList>span').empty();
    $('.statList>ul').before("<h1>" + pokeTeam[slot - 1].name + ' Base Stats</h1>');
    $('#min>ul').empty();
    $('#max>ul').empty();
    populateMoves(slot);
    var total = 0;
    for (var i = 0;i<7;i++){
      $('.statList>ul').append("<li>" + statNames[i].toUpperCase().replace('_', '.') + statChart(pokeTeam[slot - 1][statNames[i]], i, total+=pokeTeam[slot - 1][statNames[i]]) + "</li>");
      $('#min>ul').append('<li>' + min(pokeTeam[slot - 1][statNames[i]], i) + '</li>');
      $('#max>ul').append('<li>' + max(pokeTeam[slot - 1][statNames[i]], i) + '</li>');
    }
  }

  function statChart(stat, i, total){
    if (!stat)
      stat = total;
    var statPercent = Math.floor((stat / statMax[i]) * 100);
    return ('<div class="max-bar"><div class="base-bar" style="width:' + statPercent + '%">' + stat + '</div></div>');
  }

  function populateMoves(slot){
    $('#moveset').append('<option value="">Select a move</option>');
    for (var i in pokeTeam[slot - 1].moves)
      $('#moveset').append('<option value="' + pokeTeam[slot - 1].moves[i].name + '">' + pokeTeam[slot - 1].moves[i].name + '</option>')
  }

  $('#moveset').change(function(){
    var nextSpan = $('.statList>span')
    for (var i=0;i<4;i++){
      if ($('#moveset').val() === nextSpan[i].innerText)
        break;
      if ($('#moveset').val() && !nextSpan[i].innerText){
        $(nextSpan[i]).append($('#moveset').val());
        break;
      }
    }
  });

  $('.statList>span').click(function(event){
    $(this).empty();
  })

  function addType(pokemon, modifier){
    for(var i in pokemon.types)
      $.get(("http://pokeapi.co/" + pokemon.types[i].resource_uri), function(data){
        for (var c=1;c<=18;c++){
          for (var j in data.super_effective){
            if($('.typeChart tr')[c].className === data.super_effective[j].name){
              var thisRow = $('.typeChart tr')[c];
              calcCell($(thisRow).children()[1], modifier, true);
            }
          }
          for (var j in data.ineffective){
            if($('.typeChart tr')[c].className === data.ineffective[j].name){
              var thisRow = $('.typeChart tr')[c];
              calcCell($(thisRow).children()[2], modifier);
            }
          }
          for (var j in data.no_effect){
            if($('.typeChart tr')[c].className === data.no_effect[j].name){
              var thisRow = $('.typeChart tr')[c];
              calcCell($(thisRow).children()[3], modifier);
            }
          }
          for (var j in data.weakness){
            if($('.typeChart tr')[c].className === data.weakness[j].name){
              var thisRow = $('.typeChart tr')[c];
              calcCell($(thisRow).children()[4], modifier);
            }
          }
        }
      })
  }

  function removeType(pokemon){
    addType(pokemon, -1);
  }

  function cellColor(n, cell, green){
    if(green && n===1)
      $(cell).css('background-color', '#BF9');
    else if(green && n===2)
      $(cell).css('background-color', '#9E6');
    else if(green && n>2)
      $(cell).css('background-color', '#7D4');
    else if(n===1)
      $(cell).css('background-color', '#FB7');
    else if(n===2)
      $(cell).css('background-color', '#E95');
    else if(n>2)
      $(cell).css('background-color', '#D73');
    else
      $(cell).css('background-color', '#FFF');
  }

  function calcCell(thisCell, modifier, green){
    if(!thisCell.innerText){
      $(thisCell).append('1');
      cellColor(1, thisCell, green);
    } else {
      var n = parseInt(thisCell.innerText) + 1 * modifier;
      cellColor(n, thisCell, green);
      if(n)
        thisCell.innerText = n;
      else
        thisCell.innerText = '';
    }
  }

  function max(stat, i){
    var statmax;
    if(i===0){
      statmax = Math.floor((2 * stat + 31 + 252) + 100 + 10);
    } else if (i===6) {
      statmax = '';
    } else {
      statmax = Math.floor(Math.floor((2 * stat + 31 + 252) + 5) * 1.1);
    }
    return statmax;
  }

  function min(stat, i){
    var statmin;
    if (i===0){
      statmin = Math.floor((2 * stat) + 100 + 10);
    } else if (i===6) {
      statmin = ''
    } else {
      statmin = Math.floor(Math.floor((2 * stat) + 5) * 0.9);
    }
    return statmin;
  }

});

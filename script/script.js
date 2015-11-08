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
    var pokeSearch = [];

    for(var i in pokemon) {
        if(pokemon[i].name.search(/(-(?!mi)[a-z]{4,})(-[a-z]{1,})?/) === -1)
          pokeSearch.push(pokemon[i].name);
    }

    input.on('focus', function(event){
      input.val('');
    });

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
        var typeName = pokemon.types[i].name
        typeSprites += '<img src="images/' + typeName + '.png" alt="' + typeName + '" />'
      }
      return typeSprites;
    });
  };

  $('.remove').on('click', function(){
    var parent = $(this).parent()[0].className;
    removePkmn(parent.charAt(parent.length-1), event);
  });

  function removePkmn(slot, event){
    recent = slot - 1;
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
});

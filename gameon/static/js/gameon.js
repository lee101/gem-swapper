// Globals: JQuery/$

var GameOnUser = function (userJSON) {

    userJSON.saveHighScore = function (game_mode, score, callback) {
        if (typeof callback == 'undefined') {
            callback = function (data) {
            }
        }
        $.ajax({
            "url": "/gameon/savescore",
            "data": {game_mode: game_mode, score: score},
            "success": function (data) {
                callback(data)
            },
            "type": "GET",
            "cache": false,
            "error": function (xhr, error, thrown) {
                if (error == "parsererror") {
                }
            }
        });
        userJSON.scores.push({game_mode: game_mode, score: score});
    };

    userJSON.saveAchievement = function (achievementNumber, callback) {
        if (typeof callback == 'undefined') {
            callback = function (data) {
            }
        }
        $.ajax({
            "url": "/gameon/saveachievement",
            "data": {type: achievementNumber},
            "success": function (data) {
                callback(data)
            },
            "type": "GET",
            "cache": false,
            "error": function (xhr, error, thrown) {
                if (error == "parsererror") {
                }
            }
        });
        userJSON.achievements.push({type: achievementNumber})
    };

    userJSON.saveVolume = function (volume, callback) {
        if (typeof callback == 'undefined') {
            callback = function (data) {
            }
        }
        $.ajax({
            "url": "/gameon/savevolume",
            "data": {volume: volume},
            "success": function (data) {
                callback(data)
            },
            "type": "GET",
            "cache": false,
            "error": function (xhr, error, thrown) {
                if (error == "parsererror") {
                }
            }
        });
        userJSON.volume = volume
    };

    userJSON.saveMute = function (mute, callback) {
        if (typeof callback == 'undefined') {
            callback = function (data) {
            }
        }
        $.ajax({
            "url": "/gameon/savemute",
            "data": {mute: mute},
            "success": function (data) {
                callback(data)
            },
            "type": "GET",
            "cache": false,
            "error": function (xhr, error, thrown) {
                if (error == "parsererror") {
                }
            }
        });
        userJSON.mute = mute

    };

    userJSON.saveLevelsUnlocked = function (levelsUnlocked, callback) {
        if (typeof callback == 'undefined') {
            callback = function (data) {
            }
        }
        $.ajax({
            "url": "/gameon/savelevelsunlocked",
            "data": {levels_unlocked: levelsUnlocked},
            "success": function (data) {
                callback(data)
            },
            "type": "GET",
            "cache": false,
            "error": function (xhr, error, thrown) {
                if (error == "parsererror") {
                }
            }
        });
        userJSON.levels_unlocked = levelsUnlocked
    };

    userJSON.saveDifficultiesUnlocked = function (difficultiesUnlocked, callback) {
        if (typeof callback == 'undefined') {
            callback = function (data) {
            }
        }
        $.ajax({
            "url": "/gameon/savedifficultiesunlocked",
            "data": {difficulties_unlocked: difficultiesUnlocked},
            "success": function (data) {
                callback(data)
            },
            "type": "GET",
            "cache": false,
            "error": function (xhr, error, thrown) {
                if (error == "parsererror") {
                }
            }
        });
        userJSON.difficulties_unlocked = difficultiesUnlocked
    };


    return userJSON;
};
var gameon = new (function () {
    "use strict";
    var self = this;

    self.getUser = function (callback) {
        if (self.user) {
            callback(self.user);
        }
        else {

            $.ajax({
                "url": "/gameon/getuser",
                "data": {},
                "success": function (user) {
                    self.user = GameOnUser(user);
                    callback(self.user);
                },
                "type": "GET",
                "cache": false,
                "error": function (xhr, error, thrown) {
                    if (error == "parsererror") {
                    }
                }
            });
        }
    };

    // ========== SOUND ================

    soundManager.setup({
        // where to find the SWF files, if needed
        url: '/gameon/js/lib/soundmanager/script',
        onready: function () {
            // SM2 has loaded, API ready to use e.g., createSound() etc.

        },
        ontimeout: function () {
            // Uh-oh. No HTML5 support, SWF missing, Flash blocked or other issue
        }

    });

    self.loadSound = function (name, url) {
        soundManager.onready(function () {
            soundManager.createSound({
                id: name,
                url: url
            });
        });
    };

    self.playSound = function (name) {
        soundManager.onready(function () {
            soundManager.play(name);
        });
    };

    self.pauseAll = soundManager.pauseAll;
    self.resumeAll = soundManager.resumeAll;

    /**
     * @param volume 0 to 1 global volume
     */
    self.setVolume = function (volume) {
        volume = volume * 100;
        $.each(soundManager.sounds, function (name, sound) {
            sound.setVolume(volume);
        });
    };

    function _loopSound(sound) {
        sound.play({
            onfinish: function () {
                _loopSound(sound);
            }
        });
    }

    self.loopSound = function (name) {
        soundManager.onready(function () {
            var sound = soundManager.getSoundById(name);
            _loopSound(sound)
        });
    };

    self.mute = function () {
        soundManager.mute();
        self.getUser(function (user) {
            user.saveMute(1);
        });
    };

    self.unmute = function () {
        soundManager.unmute();
        self.getUser(function (user) {
            user.saveMute(0);
        });
    };

    //TODO TEST clicks
    self.muteClick = function () {
        $('.gameon-volume__unmute').show();
        $('.gameon-volume__mute').hide();
        self.mute();
    };
    self.unmuteClick = function () {
        $('.gameon-volume__unmute').hide();
        $('.gameon-volume__mute').show();
        self.unmute();
    };


    self.getUser(function (user) {
        //render volume control
        $(document).ready(function () {
            //        $('.gameon-volume').append('<input type="text" data-slider="true" value="0.4" data-slider-highlight="true" data-slider-theme="volume"/>');
            $("[data-slider]").simpleSlider("setRatio", user.volume);
            if (user.mute) {
                $('.gameon-volume__unmute').show();
                self.mute();
            }
            else {
                $('.gameon-volume__mute').show();
            }

            $("[data-slider]")
                .bind("slider:ready slider:changed", function (event, data) {
                    self.setVolume(data.ratio);

                });
        });
    });


    // ===================       Clock       ===============================

    self.clock = function (gameOver, startSeconds) {
        var self = this;
        if (!startSeconds) {
            self.startSeconds = 5 * 60;
        }
        else {
            self.startSeconds = startSeconds;
        }

        self.started = false;

        self.reset = function () {
            self.seconds = self.startSeconds;
            self.started = false;
        };

        self.start = function () {
            self.started = true;
        };
        self.unpause = self.start;
        self.pause = function () {
            self.started = false;
        };

        self.tick = function () {

        };

        self.getTime = function () {
            return self._formattedTime;
        };
        self.setTime = function (seconds) {
            self.seconds = seconds;
            self._updateFormattedTime();
        };

        self._updateFormattedTime = function () {
            var separator = ':';
            if (self.seconds % 60 <= 9) {
                separator = ':0'
            }
            self._formattedTime = Math.floor(self.seconds / 60) + separator + self.seconds % 60;
        };
        self.setTime(self.startSeconds);

        setInterval(function () {
            if (self.started) {
                self.setTime(self.seconds - 1);
                self._updateFormattedTime();
                self.tick();
                $('.gameon-clock').html(self.getTime());
                if (self.seconds <= 0) {
                    self.reset();
                    gameOver();
                }
            }
        }, 1000);

        return self;
    };

    // =====================       Board            ===========================
    var numBoards = 0;

    /**
     * tiles MUST have the functions click(), reRender() and render()
     * @param width
     * @param height
     */
    self.board = function (width, height, tiles) {
        var boardSelf = this;
        numBoards++;
        boardSelf.id = numBoards;
        boardSelf.name = 'gameonBoard' + numBoards;
        self[boardSelf.name] = boardSelf;

        boardSelf.width = width;
        boardSelf.height = height;
        boardSelf.tiles = tiles;
        for (var i = 0; i < boardSelf.tiles.length; i++) {
            var currTile = boardSelf.tiles[i];
            currTile.xPos = i % boardSelf.width;
            currTile.yPos = Math.floor(i / boardSelf.width);
            currTile.reRender = function () {

                var container = boardSelf.getRenderedTile(this.yPos,this.xPos).parent();
                var renderedData = $(this.render());
                renderedData.attr('onclick', 'gameon.' + boardSelf.name + '.click(this)');
                renderedData.attr('data-yx', boardSelf.name + '-' + this.yPos + '-' + this.xPos);
                container.html(renderedData[0].outerHTML);
            }
        }

        boardSelf.getTile = function (y, x) {
            return boardSelf.tiles[y * boardSelf.width + x];
        }

        boardSelf.getRenderedTile = function (y, x) {
            return $('[data-yx="'+boardSelf.name+'-'+y+'-'+x+'"]');
        }

        boardSelf.click = function (elm) {
            var yx = $(elm).attr('data-yx').split('-');
            var y = +yx[1];
            var x = +yx[2];
            boardSelf.getTile(y, x).click();
        }

        boardSelf.render = function (target) {
            if (typeof target === 'undefined') {
                target = '.gameon-board';
            }
            var domtable = ['<table>'];
            for (var h = 0; h < boardSelf.height; h++) {
                domtable.push("<tr>");
                for (var w = 0; w < boardSelf.width; w++) {
                    var even = 'odd';
                    if ((h + w) % 2 === 0) {
                        even = 'even';
                    }
                    domtable.push('<td class="' + even + '">');

                    var renderedData = $(boardSelf.getTile(h, w).render());
                    renderedData.attr('onclick', 'gameon.' + boardSelf.name + '.click(this)');
                    renderedData.attr('data-yx', boardSelf.name + '-' + h + '-' + w);

                    domtable.push(renderedData[0].outerHTML);
                    domtable.push("</td>");
                }
                domtable.push("</tr>");
            }
            domtable.push('</table>');

            $(target).html(domtable.join(''));
        };
    };

    self.math = new (function () {
        var self = this;
        self.numberBetween = function (a, b) {
            return Math.floor(Math.random() * (b - a) + a);
        }
    })();

    self.starbar = function (one, two, three, end) {
        var self = this;


    };

    return self;
})();
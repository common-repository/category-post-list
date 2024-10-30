// var: 20211003 0728
// This lib is needed jQuery.



var mcl = mcl || {};
(function (global) {
	var _ = mcl;

	// **************************************************************************
	// **************************** Static members ******************************
	// **************************************************************************


	// ***************************************************************************
	// **************************** Global Variable ******************************
	// ***************************************************************************

	_.IsLogEnable = false; //コンソールログへの出力有無
	_.LogLevel = 0; //Log先頭のタブ数



	// ****************************************************************************
	// **************************** Global Functions ******************************
	// ****************************************************************************

	// ================== Log ==================

	// IsLogEnableがtrueの場合にコンソールログを出力する
	_.log = function(str) {
		// str: ログに出力する文字列
		// return: void

		if(!_.IsLogEnable) return;

		var result = "";
		for(var i=0; i<_.LogLevel; i++) result += "\t";
		result += str;

		console.log(result);
	};

	// ================== Math ==================

	// 0～max-1の乱数の整数を生成する
	_.getRandomInt = function(max) {
		// max: 最大値+1

		return Math.floor(Math.random()*max);
	};

	// 配列の各要素に値を加算して返す
	_.plusToArray = function(ArgArray, value) {
		// ArgArray
		// value: 加算したい値
		// return: 結果の配列

		var result = [];
		for(var e of ArgArray) result.push(e + value);
		return result;
	};

	// 配列の各要素に値を掛けて返す
	_.timesToArray = function(ArgArray, value) {
		// ArgArray
		// value: 掛け算したい値
		// return: 結果の配列

		var result = [];
		for(var e of ArgArray) result.push(e * value);
		return result;
	};

	// 配列の各要素の値を絶対値にして返す
	_.absToArray = function(ArgArray) {
		var result = [];
		for(var e of ArgArray) result.push(Math.abs(e));
		return result;
	};

	// 引数の配列の最小値を求める
	_.getMinInArray = function(ArgArray) {
		// ArgArray
		// return: 最小値
		var f = function(a, b) { return Math.min(a,b); };
		return ArgArray.reduce(f);
	};

	// 引数の配列の最大値を求める
	_.getMaxInArray = function(ArgArray) {
		// ArgArray
		// return: 最大値
		var f = function(a, b) { return Math.max(a,b); };
		return ArgArray.reduce(f);
	};

	// ================== Array ==================

	// 第1引数配列の要素がひとつでも第2配列に存在するかを判定する
	_.existMemberInArray = function(SearchArray, TargetArray) {
		// SearchArray: 検索する要素を持つ配列
		// TargetArray: 検索対象の配列
		// return: 第1引数配列の要素がひとつでも第2配列に存在するかを判定する

		var flag = false;
		for(var temp of SearchArray) flag = flag || TargetArray.includes(temp);
		return flag;
	};

	// ================== Text ==================

	// Dateオブジェクトをフォーマットにしたがって文字列出力する
	_.formatDate = function(date, format) {
		// date: Dateオブジェクト
		// format: 出力フォーマット (ex; 2021/09/26 09:04:32)
		// ------ %Y: year (ex: 2021)
		// ------ %M: month (ex: 09)
		// ------ %D: day (ex: 26)
		// ------ %h: hour (ex: 09)
		// ------ %m: minute (ex: 04)
		// ------ %s: second (ex: 32)

		format = format.replace(/%Y/g, date.getFullYear());
		format = format.replace(/%M/g, ('0' + (date.getMonth() + 1)).slice(-2));
		format = format.replace(/%D/g, ('0' + date.getDate()).slice(-2));
		format = format.replace(/%h/g, ('0' + date.getHours()).slice(-2));
		format = format.replace(/%m/g, ('0' + date.getMinutes()).slice(-2));
		format = format.replace(/%s/g, ('0' + date.getSeconds()).slice(-2));
		return format;
	};

	// ファイル名を拡張子前と拡張に分割します
	_.splitFileNameByExtension = function(Filename) {
		// FileName: ファイル名
		// return: [拡張子前ファイル名, ファイル名]
		var result = [];

		var idx = FileName.lastIndexOf(".");
		if(idx < 0) {
			result.push(FileName);
			return result;
		}

		var header = Filename.slice(0, idx);
		var extension = Filename.slice(idx+1);
		
		result.push(header);
		result.push(extension);

		return result;
	};

	_.encodeHTMLSpecialWord = function(str) {
		return str
			.replace(/&/g, "&amp;")
			.replace(/\"/g, "&quot;")
			.replace(/\'/g, "&#39;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	};
	
	_.decodeHTMLSpecialWord = function(str) {
		return str
			.replace(/&amp;/g, "&")
			.replace(/&quot;/g, "\"")
			.replace(/&#39;/g, "\'")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">");
	};

	// GUIDを生成する
	_.getGuid = function() {
		//return GUID文字列
		var uuid = "", i, random;
		for (i = 0; i < 32; i++) {
			random = Math.random() * 16 | 0;
			uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
		}
		return uuid;
	};


	// ================== User Interface ==================

	// 要素を全画面で表示する
	_.execFullScreen = function(id) {
		// id: idを示すjQueryセレクタ文字列 (ex: "#full")
		// return: void

		_.log("MCL: Exec full screen.");

		var e = document.getElementById(id);
		if (e.requestFullscreen) {
			e.requestFullscreen();
		} else if (e.mozRequestFullScreen) { /* Firefox */
			e.mozRequestFullScreen();
		} else if (e.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
			e.webkitRequestFullscreen();
		} else if (e.msRequestFullscreen) { /* IE/Edge */
			e.msRequestFullscreen();
		}
	};

	// ドラッグアンドドロップに関わるイベントを実装する
	_.setDragAndDropEvent = function(Id, DropEvent, OtherEvents = null) {
		// DropEvent(items): dropされたときのコールバック。引数にはドロップされたものが渡される
		// OtherEvents: drop以外の dragstart,dragenter,dragover,dragleave,dragened に個別にイベントを指定したい場合はここで指定する
		//              無指定の場合はイベントがキャンセルされる
		//              こちらは通常のevent引数の関数を指定する

		var cancelEvent = function(e) {
			e.stopPropagation();
			e.preventDefault();
			return false;
		};

		// 指定エリア以外の要素でドラッグアンドドロップしても何も起きないようにする。
		var d = document;
		d.addEventListener("drop", cancelEvent, false);
		d.addEventListener("dragstart", cancelEvent, false);
		d.addEventListener("dragenter", cancelEvent, false);
		d.addEventListener("dragover", cancelEvent, false);
		d.addEventListener("dragleave", cancelEvent, false);
		d.addEventListener("dragened", cancelEvent, false);

		// 指定エリアにドラッグアンドドロップのイベントを設定する
		var e = document.getElementById(Id);
		e.addEventListener("drop", function(event) {
			event.preventDefault();
			var items = event.dataTransfer.items;
			DropEvent(items);
		}, false);
		e.addEventListener("dragstart", OtherEvents&&OtherEvents.dragstart ? OtherEvents.dragstart : cancelEvent, false);
		e.addEventListener("dragenter", OtherEvents&&OtherEvents.dragenter ? OtherEvents.dragenter : cancelEvent, false);
		e.addEventListener("dragover", OtherEvents&&OtherEvents.dragover ? OtherEvents.dragover : cancelEvent, false);
		e.addEventListener("dragleave", OtherEvents&&OtherEvents.dragleave ? OtherEvents.dragleave : cancelEvent, false);
		e.addEventListener("dragened", OtherEvents&&OtherEvents.dragened ? OtherEvents.dragened : cancelEvent, false);
	};

	//指定したセレクタまでスクロールする
	_.scrollToSelector = function(selector, animateTime=500, offset=0) {
		//selector
		//animateTime: スクロールのアニメーションの時間を指定する[msec]
		//return: void

		$([document.documentElement, document.body]).animate({
			scrollTop: $(selector).offset().top + offset
		}, animateTime);
	};

	// ================ Download =================

	// Blobデータをダウンロードさせる
	_.downloadBlob = function(FileName, BlobData) {
		// FileName
		// BlobData

		let link = document.createElement("a");
		link.download = FileName;
		link.href = BlobData;
		link.click()
	};

	// ================== File API =================

	// ファイルからBlobデータを連続で読み取る
	_.readMultipleDataFromFileList = function(FileList, Callback, idx=0, ResultList=[]) {
		// FiileList
		// Callback(ResultList): 読み取り完了時のコールバック関数。引数に後述のResultListが渡される
		// idx: 再帰用に内部で使用する値
		// ResultList: fileとblobをメンバに持つオブジェクトの配列

		if(idx >= FileList.length) {
			Callback(ResultList);
			return;
		}

		var file = FileList[idx];

		var reader = new FileReader();
		reader.addEventListener("load", function() {
			idx++;
			var r = {
				file: file,
				blob: reader.result
			};
			ResultList.push(r);
			_.readMultipleDataFromFileList(FileList, Callback, idx, ResultList);
		});
		reader.readAsDataURL(file);
	};

	// ================== Google Icon =================

	// Google Iconを持つspan要素を生成する(Google Icon CSSのロードが事前に必要)
	_.createGoogleIcon = function(iconId) {
		// iconId: Google IconのId
		// return: Google Iconを持つspan要素
		var e = $("<span>").attr("class", "material-icons").text(iconId);
		return(e);
	};

	// ================== URL =================

	_.getUrlQuery = function(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	};

	// ================== Cookie =================

	// 長い文字列を分割してクッキーに保存する
	_.writeCookieLongStr = function({str="", key="", size=1024, maxMember=10, expires=365}) {
		mcl.log(str);
		for(var i=0; i<maxMember; i++) {
			var s = str.substring(i*size,(i+1)*size);
			$.cookie(key+"_"+i, s, {expires: expires});
		}
	};

	// クッキーに分割して保存された文字列を復元する
	_.readCookieLongStr = function({key="", maxMember=10}) {
		var result = "";
		for(var i=0; i<maxMember; i++) {
			var s = $.cookie(key+"_"+i);
			if(s == undefined) return undefined;
			result += s;
		}
		return result;
	}

	// クッキーに分割された文字列を削除する
	_.deleteCoolieLongStr = function({key="", maxMember=10}) {
		for(var i=0; i<maxMember; i++) {
			$.removeCookie(COOKIE_KEY+"_"+i);
		}
	}


	// ***********************************************************************
	// **************************** Static Exec ******************************
	// ***********************************************************************

	

}(this));
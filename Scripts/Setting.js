var $ = jQuery;
mcl.IsLogEnable = true;

var CategoryList = null;
var PostList = null;
var Setting = null;

const TYPE_POST = "post";
const TYPE_H2 = "h2";
const TYPE_H3 = "h3"
const TYPE_H4 = "h4";
const TYPE_INTEND_START = "intend_start";
const TYPE_INTEND_END = "intend_end";
const TYPE_TEXT = "text";

const OutputItemList_DataClass = class {
	constructor(p, type) {
		this.Type = type;
		this.Guid = mcl.getGuid();
		this.Id = p!=null ? p.id : "";
		this.Title = p!=null ? p.title : "";
		this.Url = p!=null ? p.url : "";
	}
}

window.addEventListener('load', function(){
	mcl.log("========== PROGRAM START ==========");

	//form欄の余計なものは隠す(設定が壊れても表示できるようにCSSで隠さずにJSで隠す)
	$("form h2").hide();
	$("form table").eq(0).hide();

	//カテゴリを選択したらクエリをつけたURLに遷移する
	$("#SelectCategory").on("change", (e)=>{
		var slug = $("#SelectCategory").val();
		location.href= "options-general.php?page=category_post_list" + "&category=" + slug;
	});

	mcl.log("Selected category slug: "+ SelectedCategorySlug);
	if(SelectedCategorySlug != "") $("#HiddenWhenNotSelectCategory").show();

	mcl.log("Post List: ");
	PostList = JSON.parse(JsonPostList);
	mcl.log(JSON.stringify(PostList, null, "\t"));
	if(PostList.length == 0) {
		mcl.log("PostList is empty. PROGRAM END.");
		return;
	}

	$("#Separator_H2").click(function() {
		addOutputItemList(new OutputItemList_DataClass(null, TYPE_H2));
	});
	$("#Separator_H3").click(function() {
		addOutputItemList(new OutputItemList_DataClass(null, TYPE_H3));
	});
	$("#Separator_H4").click(function() {
		addOutputItemList(new OutputItemList_DataClass(null, TYPE_H4));
	});
	$("#Separator_IndentStart").click(function() {
		addOutputItemList(new OutputItemList_DataClass(null, TYPE_INTEND_START));
	});
	$("#Separator_IndentEnd").click(function() {
		addOutputItemList(new OutputItemList_DataClass(null, TYPE_INTEND_END));
	});
	$("#Separator_Text").click(function() {
		addOutputItemList(new OutputItemList_DataClass(null, TYPE_TEXT));
	});

	showPostListTable();

	$("#HidePostAdded").change(function() { showPostListTable(); });
	$("#ButtonAddAllPost").click(function() { addAllPost(); });

	$("#OutputItemList").sortable({
		update: function() {
			refreshOutputItem();
			refreshReview();
		}
	});

	$("#ButtonMultipleMove").click(function() {
		buttonMultipleMove();
	});

	$("#ButtonDeleteAllOutputListItem").click(function() {
		$("#OutputItemList").empty();
		showPostListTable();
		refreshReview();
	});

	mcl.log("Setting: ");
	Setting = JSON.parse(JsonSetting);
	mcl.log(mcl.decodeHTMLSpecialWord(JSON.stringify(Setting, null, "\t")));

	restoreSetting();

	$("#OptionForm").submit((e) => {
		if( $("#ResetAllSettings").prop("checked") ) {
			var po = JSON.parse(CategoryPostList_PO);
			var c = window.confirm(po.e1b1a233f91e4d2a9978ca797d9de8e8);
			if(!c) return false;
		}
	});

	$("#ShortCode").val(["[CategoryPostList category_slug='" + SelectedCategorySlug + "']"]);
	$("#CopyButton_ShortCode").click(function() {
		$("#ShortCode").select();
		document.execCommand("copy");
		var po = JSON.parse(CategoryPostList_PO);
		toastr.success(po.b290b09be16043f0ab221f82a8abb282);
	});

	$("#CopyButton_HTML").click(function() {
		$("#showResultHTML").select();
		document.execCommand("copy");
		var po = JSON.parse(CategoryPostList_PO);
		toastr.success(po.b290b09be16043f0ab221f82a8abb282);
	});

});

function createIcon(iconId) {
	var e = $("<span>").attr("class", "material-icons").text(iconId);
	return(e);
}

function addCategoryToSelect() {
	if($.isPlainObject(CategoryList)) {
		//連想配列のとき
		for(var key in CategoryList) {
			var category = CategoryList[key];
			var o = $("<option>")
				.text(category.name)
				.val(category.slug);
			$("select[name=SelectCategory]").append(o);
		}
	} else {
		//通常配列のとき
		for(var category of CategoryList) {
			var o = $("<option>")
				.text(category.name)
				.val(category.slug);
			$("select[name=SelectCategory]").append(o);
		}
	}
}

function isPostAdded(Id) {
	var tdList = $("#OutputItemList .tdJson");
	for(var td of tdList) {
		var json = $(td).text();
		var obj = JSON.parse(json);
		if(obj.Id == Id) return true;
	}
	return false;
}

function showPostListTable() {
	$("#PostListTable").empty();

	for(var p of PostList) {
		var d = new OutputItemList_DataClass(p, TYPE_POST);

		if($("#HidePostAdded").prop("checked") && isPostAdded(d.Id)) continue;

		var tr = $("<tr>").attr("id", "PostList_"+d.Guid);

		var tdJosn = $("<td>")
			.attr("class", "tdJson")
			.text(JSON.stringify(d));
		tr.append(tdJosn);

		var tdIconAdd = $("<td>").attr("class", "tdIcon");
		var iconAdd = $(createIcon("control_point"));
		tdIconAdd.append(iconAdd);
		tr.append(tdIconAdd);

		var tdIconPost = $("<td>").attr("class", "tdIcon");
		var iconPost = $(createIcon("text_snippet"));
		tdIconPost.append(iconPost);
		tr.append(tdIconPost);

		var tdTitle = $("<td>").attr("class", "tdText");
		var a = $("<a>")
			.text(d.Title)
			.attr("href", d.Url)
			.attr("target", "_blank")
			.click(function(e) { e.stopPropagation(); });
		tdTitle.append(a)
		tr.append(tdTitle);

		$("#PostListTable").append(tr);

		$("body").on("click", "#PostList_"+d.Guid, {d: d}, function(e) {
			addOutputItemList(e.data.d);
			showPostListTable();
		});
		
	}
}

function addOutputItemList(d) {
	var tr = $("<tr>")
		.attr("id", "OutputItemList_"+d.Guid);

	var tdJson = $("<td>").attr("class", "tdJson");
	tdJson.text(JSON.stringify(d));
	tr.append(tdJson);

	var tdIcon = $("<td>").attr("class", "tdIcon");
	var iconMain;
	switch(d.Type) {
		case TYPE_POST:
			iconMain = createIcon("text_snippet");
			break;
		case TYPE_H2:
			iconMain = createIcon("filter_2");
			break;
		case TYPE_H3:
			iconMain = createIcon("filter_3");
			break;
		case TYPE_H4:
			iconMain = createIcon("filter_4");
			break;
		case TYPE_INTEND_START:
			iconMain = createIcon("format_indent_increase");
			break;
		case TYPE_INTEND_END:
			iconMain = createIcon("format_indent_decrease");
			break;
		case TYPE_TEXT:
			iconMain = createIcon("format_quote");
			break;
	}
	tdIcon.append(iconMain);
	tr.append(tdIcon);
	
	var tdTitle = $("<td>").attr("class", "tdText");
	switch(d.Type) {
		case TYPE_POST:
			//tdTitle.append("[POST] ");
			var a = $("<a>")
				.text(d.Title)
				.attr("href", d.Url)
				.attr("target", "_blank");
			tdTitle.append(a)
			break;

		case TYPE_H2:
			tdTitle.append("[H2] ");
			var input = $("<input type='text' size='60'>")
				.attr("id", "h2Input_"+d.Guid)
				.val([d.Title]);
			tdTitle.append(input);
			$("body").on("change", "#h2Input_"+d.Guid, {d: d}, function(e) {				
				var val = $("#h2Input_"+e.data.d.Guid).val();
				d.Title = val;
				$("#OutputItemList_"+e.data.d.Guid+" .tdJson").text(JSON.stringify(d));
				refreshReview();
			});
			break;
		
		case TYPE_H3:
			tdTitle.append("[H3] ");
			var input = $("<input type='text' size='60'>")
				.attr("id", "h3Input_"+d.Guid)
				.val([d.Title]);
			tdTitle.append(input);
			$("body").on("change", "#h3Input_"+d.Guid, {d: d}, function(e) {				
				var val = $("#h3Input_"+e.data.d.Guid).val();
				d.Title = val;
				$("#OutputItemList_"+e.data.d.Guid+" .tdJson").text(JSON.stringify(d));
				refreshReview();
			});
			break;

		case TYPE_H4:
			tdTitle.append("[H4] ");
			var input = $("<input type='text' size='60'>")
				.attr("id", "h4Input_"+d.Guid)
				.val([d.Title]);
			tdTitle.append(input);
			$("body").on("change", "#h4Input_"+d.Guid, {d: d}, function(e) {				
				var val = $("#h4Input_"+e.data.d.Guid).val();
				d.Title = val;
				$("#OutputItemList_"+e.data.d.Guid+" .tdJson").text(JSON.stringify(d));
				refreshReview();
			});
			break;

		case TYPE_INTEND_START:
			tdTitle.append("[INTEND START]");
			break;

		case TYPE_INTEND_END:
			tdTitle.append("[INTEND END]");
			break;

		case TYPE_TEXT:
			tdTitle.append("[TEXT] ");
			var input = $("<input type='text' size='60'>")
				.attr("id", "textInput_"+d.Guid)
				.val([d.Title]);
			tdTitle.append(input);
			$("body").on("change", "#textInput_"+d.Guid, {d: d}, function(e) {				
				var val = $("#textInput_"+e.data.d.Guid).val();
				d.Title = val;
				$("#OutputItemList_"+e.data.d.Guid+" .tdJson").text(JSON.stringify(d));
				refreshReview();
			});
			break;
	}
	tr.append(tdTitle);

	var tdNumber = $("<td>").attr("class", "tdNumber").text("INIT");
	tr.append(tdNumber);

	var tdDeleteIcon = $("<td>").attr("class", "tdIcon");
	var iconDelete = createIcon("highlight_off").attr("id", "iconDelete_"+d.Guid);
	tdDeleteIcon.append(iconDelete);
	tr.append(tdDeleteIcon);

	$("#OutputItemList").append(tr);

	$("body").on("click", "#iconDelete_"+d.Guid, {guid: d.Guid}, function(e) {
		$("#OutputItemList_"+e.data.guid).remove();
		showPostListTable();
		refreshReview();
	});

	refreshOutputItem();
	refreshReview();
}

function addAllPost() {
	var tdList = $("#PostListTable .tdJson");
	for(var td of tdList) {
		var json = $(td).text();
		var d = JSON.parse(json);
		addOutputItemList(d);
	}
	showPostListTable();
}

function getOutputItemListAsJsonObjList() {
	var tdList = $("#OutputItemList .tdJson");
	var jsonObjList = [];
	for(var td of tdList) {
		var json = $(td).text();
		var obj = JSON.parse(json);
		jsonObjList.push(obj);
	}
	return jsonObjList;
}

function refreshOutputItem() {
	$(".OutputItemLevelHeader").remove();

	var trList = $("#OutputItemList tr");
	var level = 0;

	for(var idx=0; idx<trList.length; idx++) {
		var tr = trList[idx];
		$(tr).find(".tdNumber").text(idx);

		var json = $(tr).find(".tdJson").text();
		var obj = JSON.parse(json);

		switch(obj.Type) {
			case TYPE_INTEND_END:	level--; break;
			case TYPE_H2:			level=0; break;
			case TYPE_H3:			level=0; break;
			case TYPE_H4:			level=0; break;
		}

		for(var i=0; i<level; i++) {
			var header = $("<span>").text("subdirectory_arrow_right").attr("class", "OutputItemLevelHeader material-icons");
			$(tr).find(".tdText").prepend(header);
		}

		switch(obj.Type) {
			case TYPE_INTEND_START:	level++; break;
		}

	}
}

function refreshReview() {
	var jsonObjList = getOutputItemListAsJsonObjList();
	var level = 0;
	var html = "<div class='CategoryPostList_Result'>";

	for(var obj of jsonObjList) {
		obj.Title = mcl.decodeHTMLSpecialWord(obj.Title);
		switch(obj.Type) {
			case TYPE_POST:
				if(level>0) html +="<li>";
				html += "<a href='"+obj.Url+"'>" + obj.Title + "</a><br>";
				if(level>0) html +="</li>";
				break;
			
			case TYPE_INTEND_START:
				html += "<ul>";
				level++;
				break;
			
			case TYPE_INTEND_END:
				html += "</ul>";
				level--;
				break;

			case TYPE_TEXT:
				if(level>0) html +="<li>";
				html += "<span>" + obj.Title + "<span><br>";
				if(level>0) html +="</li>";
				break;

			case TYPE_H2:
				for(var i=0; i<level; i++) html += "</ul>";
				html += "<h2>"+obj.Title+"</h2>";
				break;

			case TYPE_H3:
				for(var i=0; i<level; i++) html += "</ul>";
				html += "<h3>"+obj.Title+"</h3>";
				break;

			case TYPE_H4:
				for(var i=0; i<level; i++) html += "</ul>";
				html += "<h4>"+obj.Title+"</h4>";
				break;

		}
	}
	for(var i=0; i<level; i++) html += "</ul>";
	html += "</div>";

	$("#PreviewArea").html(html);

	$("#ResultJSON_" + SelectedCategorySlug).val([JSON.stringify(jsonObjList)]);
	$("#ResultHTML_" + SelectedCategorySlug).val([html]);

	$.each($(".ResultJSON"), (i, e) => {
		$(e).val([ mcl.encodeHTMLSpecialWord( mcl.decodeHTMLSpecialWord($(e).val()) ) ]);
	});
	$.each($(".ResultHTML"), (i, e) => {
		$(e).val([ mcl.encodeHTMLSpecialWord( mcl.decodeHTMLSpecialWord($(e).val()) ) ]);
	});
	
	$("#showResultHTML").text(html);
}

function restoreSetting() {
	var json = Setting["JSON_"+SelectedCategorySlug];

	//設定がないのであれば何もしない
	if(json == undefined || json == "") return;

	var objList = JSON.parse(mcl.decodeHTMLSpecialWord(json));

	for(var obj of objList) {
		if(obj.Type == TYPE_POST) {
			//記事の場合はIdに基づいてタイトルとURLを更新する
			for(var post of PostList) {
				if(obj.Id == post.id) {
					obj.Title = post.title;
					obj.Url = post.url;
					addOutputItemList(obj);
				} else {
					//記事が削除されている場合はスキップする
				}
			}
		} else {
			addOutputItemList(obj);
		}
	}
	
	showPostListTable();
}

function buttonMultipleMove() {
	var StartIndex = Number.parseInt($("#MultipleMove_StartIndex").val());
	var EndIndex = Number.parseInt($("#MultipleMove_EndIndex").val());
	var InsertIndex = Number.parseInt($("#MultipleMove_InsertIndex").val());
	
	var trList = $("#OutputItemList tr");
	var trInsert = $("#OutputItemList tr").eq(InsertIndex);
	for(var i=StartIndex; i<=EndIndex; i++) {
		var tr = trList[i];
		$(tr).insertBefore(trInsert);
	}

	refreshOutputItem();
	refreshReview();
}

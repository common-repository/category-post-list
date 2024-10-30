<?php

/*
Plugin Name: Create Category Post List
Description: Create and export your post list of a category.
Version: 2.2
Author: Aresei
Author URI: https://www.aresei-note.com/
Text Domain: CategoryPostList
*/

load_plugin_textdomain("CategoryPostList", false, dirname(plugin_basename( __FILE__ )) . "/languages");

class CategoryPostList_SettingClass {
	const OPTION = "CategoryPostList_Settings";
	const OPTION_GROUP = "CategoryPostList_Settings_Group";
	const PAGE = "CategoryPostList_Page_Setting";
	const SETTING_PAGE_SLUG = "category_post_list";

	const SECTION_CREATE_LIST = "CategoryPostList_Section_CreateList";
	const ID_JSON = "JSON";
	const ID_HTML = "HTML";

	const SECTION_GENERAL = "CategoryPostList_Section_General";
	const ID_RESET_ALL_SETTINGS = "ResetAllSetings";

	function init() {
		$this->initOption();

		//クエリにカテゴリが設定されていなければ中断する

		register_setting(
			self::OPTION_GROUP,
			self::OPTION
		);

		add_settings_section(
			self::SECTION_CREATE_LIST,
			__( 'Create List', 'CategoryPostList' ),
			null, //section html callback
			self::PAGE
		);
		foreach(get_categories() as $cat) {
			$this->addField(self::SECTION_CREATE_LIST, self::ID_JSON."_".$cat->slug, "JSON", array("cat" => $cat));
			$this->addField(self::SECTION_CREATE_LIST, self::ID_HTML."_".$cat->slug, "HTML", array("cat" => $cat));
		}

		add_settings_section(
			self::SECTION_GENERAL,
			__( 'General', 'CategoryPostList' ),
			null, //section html callback
			self::PAGE
		);
		$this->addField(self::SECTION_GENERAL, self::ID_RESET_ALL_SETTINGS, __("Reset all settings", "CategoryPostList"), array());

	}

	function initOption() {
		$option = get_option(self::OPTION, null);

		//リセットフラグが立っていたら全設定をクリア
		if(isset($option) && isset($option[self::ID_RESET_ALL_SETTINGS])) {
			delete_option(self::OPTION);
			header("Location: " . esc_url($_SERVER['PHP_SELF']."?page=".self::SETTING_PAGE_SLUG) );
		}

		//空ならば初期値を作成
		if(!isset($option)) {
			update_option( self::OPTION, $option);
		}
	}

	function getCategorySlug() {
		return isset($_GET["category"]) ? sanitize_key($_GET["category"]) : null;
	}

	function createID($id) {
		return $this->getCategorySlug()!=null ? 
			$this->getCategorySlug()."[".$id."]" : 
			"[ERROR][".$id."]";
	}

	function getName($id) {
		return $this->getCategorySlug()!=null ? 
			self::OPTION."[".$this->getCategorySlug()."][".$id."]" : 
			self::OPTION."[ERROR][".$id."]";
	}

	function addField($section, $id, $title, $argArray) {
		$newArray = array(
			"id" => $id,
			"title" => $title
		);
		$newArray = array_merge($newArray, $argArray);

		add_settings_field(
			$id,
			$title,
			array($this, "htmlField"),
			self::PAGE,
			$section,
			$newArray
		);
	}

	function htmlField($arg) {
		//クエリにカテゴリが設定されていなければ中断する
		if($this->getCategorySlug()==null) return;

		$id = $arg["id"];
		$cat = $arg["cat"];
		$option = get_option(self::OPTION);

		if(strpos($id, self::ID_JSON) !== false) {
				?>
				<textarea name="<?php echo esc_attr(self::OPTION.'['.$id.']'); ?>" id="ResultJSON_<?php echo esc_attr($cat->slug) ?>" class="ResultJSON">
					<?php echo esc_html( isset($option[$id]) ? $option[$id] : "" ); ?>
				</textarea>
				<?php
		}
		if(strpos($id, self::ID_HTML) !== false) {
			?>
			<textarea name="<?php echo esc_attr(self::OPTION.'['.$id.']'); ?>" id="ResultHTML_<?php echo esc_attr($cat->slug) ?>" class="ResultHTML">
				<?php echo esc_html( isset($option[$id]) ? $option[$id] : "" ); ?>
			</textarea>
			<?php
		}
		if(strpos($id, self::ID_RESET_ALL_SETTINGS) !== false) {
			?>
			<input name="<?php echo esc_attr(self::OPTION.'['.$id.']'); ?>" id="ResetAllSettings" type="checkbox">
			<?php
		}

	}

	function addMenu() {
		add_options_page(
			"Create Category Post List",
			"Create Category Post List",
			"manage_options",
			self::SETTING_PAGE_SLUG,
			array($this, "htmlMenu")
		);
	}

	function htmlMenu() {
		//管理者以外のアクセスを弾く
		if ( ! current_user_can( 'manage_options' ) ) return;
		?>

		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ) ; ?></h1>

			<br>
			<strong><?php esc_html_e("Category: ", "CategoryPostList"); ?></strong>
			<select id="SelectCategory">
				<option value=""><?php esc_html_e("Please select", "CategoryPostList"); ?></option>
				<?php
				foreach(get_categories() as $cat) {
					?>
					<option value="<?php echo esc_attr($cat->slug); ?>" <?php echo $this->getCategorySlug()==$cat->slug ? "selected" : "" ?>><?php echo esc_html($cat->name); ?></option>
					<?php
				}
				?>
			</select>
			
			<br>
			<br>
			<strong><?php esc_html_e("Use guide: ", "CategoryPostList"); ?></strong>
			<a href='https://aresei-note.com/12479'><?php esc_html_e("Please see this page", "CategoryPostList"); ?></a>

			<hr class="hr_two">
			
			<div id="HiddenWhenNotSelectCategory" style="display: none;">
			
				<h2><?php esc_html_e("Create List", "CategoryPostList") ?></h2>
				<div id="ColumnWrapper">
					<div id="LeftColumn">
						<h3><?php esc_html_e("Separators", "CategoryPostList");  ?></h3>
						<table id="SeparatorTable">
							<tr id="Separator_H2">
								<td class="tdIcon"><span class="material-icons">control_point</span></td>
								<td class="tdIcon"><span class="material-icons">filter_2</span></td>
								<td><?php esc_html_e("H2 HEADLINE", "CategoryPostList");  ?></td>
							</tr>
							<tr id="Separator_H3">
								<td class="tdIcon"><span class="material-icons">control_point</span></td>
								<td class="tdIcon"><span class="material-icons">filter_3</span></td>
								<td><?php esc_html_e("H3 HEADLINE", "CategoryPostList");  ?></td>
							</tr>
							<tr id="Separator_H4">
								<td class="tdIcon"><span class="material-icons">control_point</span></td>
								<td class="tdIcon"><span class="material-icons">filter_4</span></td>
								<td><?php esc_html_e("H4 HEADLINE", "CategoryPostList");  ?></td>
							</tr>
							<tr id="Separator_IndentStart">
								<td class="tdIcon"><span class="material-icons">control_point</span></td>
								<td class="tdIcon"><span class="material-icons">format_indent_increase</span></td>
								<td><?php esc_html_e("INTEND START", "CategoryPostList");  ?></td>
							</tr>
							<tr id="Separator_IndentEnd">
								<td class="tdIcon"><span class="material-icons">control_point</span></td>
								<td class="tdIcon"><span class="material-icons">format_indent_decrease</span></td>
								<td><?php esc_html_e("INTEND END", "CategoryPostList");  ?></td>
							</tr>
							<tr id="Separator_Text">
								<td class="tdIcon"><span class="material-icons">control_point</span></td>
								<td class="tdIcon"><span class="material-icons">format_quote</span></td>
								<td><?php esc_html_e("TEXT", "CategoryPostList");  ?></td>
							</tr>
						</table>
						<h3><?php esc_html_e("Posts", "CategoryPostList");  ?></h3>
						<table id="PostListTable"></table>
						<div style="text-align: right">
							<label for="HidePostAdded"><?php esc_html_e("Hide added posts: ", "CategoryPostList");  ?></label>
							<input type="checkbox" id="HidePostAdded" checked/>
						</div>
						<div style="text-align: right; margin-top: 0.5em;">
							<button id="ButtonAddAllPost"><?php esc_html_e("Add all post", "CategoryPostList");  ?></button>
						</div>
					</div>
					<div id="MiddleColumn"></div>
					<div id="RightColumn">
						<h2><?php esc_html_e("Output items", "CategoryPostList");  ?></h2>
						<table><tbody id="OutputItemList"></tbody></table>
						<strong><?php esc_html_e("Note: You can change the order of items by mouse drag", "CategoryPostList");  ?></strong><br>
						<br>
						Multiple move:
						　Start Index: <input type='number' style="width: 5em;" id="MultipleMove_StartIndex">
						　End Index: <input type='number' style="width: 5em;" id="MultipleMove_EndIndex">
						　Insert Index: <input type='number' style="width: 5em;" id="MultipleMove_InsertIndex">
						　<button id="ButtonMultipleMove">Exec</button>
						<br>
						<div style="text-align: right;">
							<button id="ButtonDeleteAllOutputListItem"><?php esc_html_e("Delete all item", "CategoryPostList");  ?></button>
						</div>
					</div>
				</div>	

				<form id="OptionForm" action="options.php" method="post">
					<?php
					settings_fields(self::OPTION_GROUP, self::OPTION);
					do_settings_sections( self::PAGE );
					submit_button();
					?>
				</form>

				<hr class="hr_two">

				<h2><?php _e("Output preview", "CategoryPostList");  ?></h2>
				<div id="PreviewArea"></div>
				<?php _e("In this setting page, your theme's css is not applied to the output preview", "CategoryPostList");  ?>

				<hr>

				<h2><?php _e("How to insert this list to your post ?", "CategoryPostList");  ?></h2>
				<?php
					_e("After saving the settings, please insert the following shortcode to your post", "CategoryPostList"); 
				?>
				<br>
				<input type="text" size="60" id="ShortCode"/>
				<span id="CopyButton_ShortCode" style="margin-left: 0.5em;">[Copy]</span><br>
				<br>
				<?php
					_e("Alternatively, insert the following HTML codes to your post", "CategoryPostList"); 
				?>
				<br>
				<textarea id="showResultHTML" style="width: 50%;"></textarea>
				<span id="CopyButton_HTML" style="margin-left: 0.5em;">[Copy]</span>

				<hr>

			</div> <!-- hidden div @ not category selected -->

			<hr class="hr_two">
			
			<h2><?php esc_html_e("Donation", "CategoryPostList"); ?></h2>
			<?php esc_html_e("If you support this plugin, please consider donate by following link:", "CategoryPostList"); ?><br>
			<br>
			<h3><?php esc_html_e("By credit card", "CategoryPostList" ); ?></h3>
			<script type='text/javascript' src='https://storage.ko-fi.com/cdn/widget/Widget_2.js'></script><script type='text/javascript'>kofiwidget2.init('Support Me on Ko-fi', '#29abe0', 'I3I16APH2');kofiwidget2.draw();</script>
			<h3><?php esc_html_e("By bitcoin", "CategoryPostList" ); ?></h3>
			Bitcoin address: 1J94VS6ANWzRW9gako6cM8sqCz6MbiXpnt<br>

		</div>

		<?php
	}

	function addScript() {
		if(!isset($_GET["page"]) || sanitize_key($_GET["page"])!=self::SETTING_PAGE_SLUG ) return;

		$plugin_name = "CategoryPostList";
		$option = get_option(self::OPTION);

		// === JavaScript ===
		$name = "toastr.min.js";
		$url = plugins_url("Scripts/".$name, __FILE__); $path = plugin_dir_path(__DIR__) . $plugin_name."/Scripts/".$name; $time = filemtime($path);
		wp_enqueue_script($plugin_name."_toastr",$url,array("jquery"),$time,false);
	
		wp_enqueue_script('jquery-ui-sortable');

		$name = "MyCommonLibrary.js";
		$url = plugins_url("Scripts/".$name, __FILE__); $path = plugin_dir_path(__DIR__) . $plugin_name."/Scripts/".$name; $time = filemtime($path);
		wp_enqueue_script($plugin_name."_MyCommonLibrary",$url,array("jquery"),$time,false);
	
		$name = "Setting.js";
		$url = plugins_url("Scripts/".$name, __FILE__); $path = plugin_dir_path(__DIR__) . $plugin_name."/Scripts/".$name; $time = filemtime($path);
		wp_enqueue_script($plugin_name."_Setting",$url,array("jquery", $plugin_name."_MyCommonLibrary"),$time,false);
	
		$po = array(
			"e1b1a233f91e4d2a9978ca797d9de8e8" => esc_html__("checkbox[Reset all settings] is checked. Reset all settings. Really OK?", "CategoryPostList"),
			"b290b09be16043f0ab221f82a8abb282" => esc_html__("Copied to clipboard !!", "CategoryPostList")
		);
		$InlineScript = 
		"var JsonCategoryList = '" . json_encode(get_categories()) . "';\n".
		"var SelectedCategorySlug = '" . sanitize_key($_GET["category"]) . "';\n".
		"var JsonPostList = '" . json_encode($this->getPostList()) . "';\n".
		"var JsonSetting = '" . json_encode(str_replace("\t", "", $option)) . "';".
		"var CategoryPostList_PO = '".json_encode( $po )."';\n".
		"";
		wp_add_inline_script($plugin_name."_Setting", $InlineScript, "before");

		// === StyleSheet ===
		$name = "Setting.css";
		$url = plugins_url("Scripts/".$name, __FILE__); $path = plugin_dir_path(__DIR__) . $plugin_name."/Scripts/".$name; $time = filemtime($path);
		wp_enqueue_style($plugin_name."_Setting",$url,array(),$time);

		$name = "GoogleMaterialIcons.css";
		$url = plugins_url("Scripts/".$name, __FILE__); $path = plugin_dir_path(__DIR__) . $plugin_name."/Scripts/".$name; $time = filemtime($path);
		wp_enqueue_style($plugin_name."_GoogleMaterialIcons",$url,array(),$time);
	
		$name = "toastr.min.css";
		$url = plugins_url("Scripts/".$name, __FILE__); $path = plugin_dir_path(__DIR__) . $plugin_name."/Scripts/".$name; $time = filemtime($path);
		wp_enqueue_style($plugin_name."_toastr",$url,array(),$time);
	}

	function getPostList() {
		$result = array();
		$slug = $this->getCategorySlug();
		$arg = [
			"posts_per_page" => -1,
			"order" => "DEC",
			"orderby" => "date",
			"category_name" => $slug,
			"fields" => "ids"
			];
		$IdList = get_posts($arg);
		foreach($IdList as $id) {
			$d = array(
				"id" => $id,
				"title" => html_entity_decode(get_the_title($id)),
				"url" => get_permalink($id)
			);
			array_push($result, $d);
		}
		return $result;
	}

	function addSettingLink($links) {
		$data = '<a href="options-general.php?page='.self::SETTING_PAGE_SLUG.'">' . esc_html__("Settings", "CategoryPostList") . '</a>';
		array_push($links, $data);
		return $links;
	}

	function addShortCode($atts) {
		extract(
			shortcode_atts(
				array(
					'category_slug' => '',
				  ), $atts
			  )
		);
		$option = get_option(self::OPTION);
		if(isset($option["HTML_".$category_slug])) {
			return htmlspecialchars_decode(wp_kses_post($option["HTML_".$category_slug]), ENT_QUOTES);
		} else {
			return "[CreateCategoryPostList: ERROR]";
		}
	}

}

$CategoryPostList_Setting = new CategoryPostList_SettingClass();

// =================== プラグイン管理画面のみ実行 ===================
add_action( "admin_init", array($CategoryPostList_Setting, "init") );
add_action( "admin_menu", array($CategoryPostList_Setting, "addMenu") );
add_action( "admin_enqueue_scripts", array($CategoryPostList_Setting, "addScript"), 99 );

// =================== 設定画面へのリンクを追加 ======================
add_filter('plugin_action_links_'.plugin_basename(__FILE__) , array($CategoryPostList_Setting, "addSettingLink"));

// =================== ショートコード追加 ======================

add_shortcode("CategoryPostList", array($CategoryPostList_Setting, "addShortCode") );

?>
<?php
  if( function_exists('acf_add_options_page') ) {
    $parent = acf_add_options_page(array(
      'page_title' 	=> 'Theme Settings',
      'menu_title' 	=> 'Theme Settings',
      'redirect' 		=> false,
      'capability'      => 'edit_posts',
      'show_in_graphql' => true,
    ));
  }
?>

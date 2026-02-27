<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
	
if ( ! class_exists( 'bt_bb_cc_element' ) && class_exists( 'BT_BB_Element' ) ) {

	class bt_bb_cc_element extends BT_BB_Element {

			function handle_shortcode( $atts, $content ) {
				extract( shortcode_atts( apply_filters( 'bt_bb_extract_atts_' . $this->shortcode, array(
					'cost_calculator'       => ''
				) ), $atts, $this->shortcode ) );

				$class		= array( $this->shortcode );
				$class[]	= 'bt-cost-calculator';

				if ( $el_class != '' ) {
					$class[] = $el_class;
				}

				$id_attr = '';
				if ( $el_id != '' ) {
					$id_attr = ' ' . 'id="' . esc_attr( $el_id ) . '"';
				}

				$style_attr = '';
				$el_style = apply_filters( $this->shortcode . '_style', $el_style, $atts );
				if ( $el_style != '' ) {
					$style_attr = ' ' . 'style="' . esc_attr( $el_style ) . '"';
				}

				do_action( $this->shortcode . '_before_extra_responsive_param' );
				foreach ( $this->extra_responsive_data_override_param as $p ) {
					if ( ! is_array( $atts ) || ! array_key_exists( $p, $atts ) ) continue;
					$this->responsive_data_override_class(
						$class, $data_override_class,
						apply_filters( $this->shortcode . '_responsive_data_override', array(
							'prefix' => $this->prefix,
							'param' => $p,
							'value' => $atts[ $p ],
						) )
					);
				}

				$class = apply_filters( $this->shortcode . '_class', $class, $atts );

				$output = '';

				if ( isset( $cost_calculator ) ) {
					$output .=  do_shortcode( '[bt_cc id="' . $cost_calculator . '"]' ); // [cost_calculator id="948"]
				}

				$output = '<div' . $id_attr . ' class="' . esc_attr( implode( ' ', $class ) ) . '"' . $style_attr . '>' . $output . '</div>';

				$output = apply_filters( 'bt_bb_general_output', $output, $atts );
				$output = apply_filters( $this->shortcode . '_output', $output, $atts );


				return $output;
			}

			function map_shortcode() {
				$cost_calculators = $this->bt_bb_get_cc_list(); 

				bt_bb_map( $this->shortcode, array( 'name' => esc_html__( 'Cost Calculator', 'bt-cost-calculator' ), 'description' => esc_html__( 'Choose which Cost Calculator to show', 'bt-cost-calculator' ),  
				'icon' => $this->prefix_backend . 'icon' . '_' . $this->shortcode,
					'params' => array(
						array( 'param_name' => 'cost_calculator', 'type' => 'dropdown', 'heading' => esc_html__( 'Choose Cost Calculator', 'bt-cost-calculator' ), 'description' => esc_html__( 'Choose wich Cost Calculator to show', 'bt-cost-calculator' ), 'value' => $cost_calculators, 'preview' => true ),
					) 
				) );
			} 
			
			function bt_bb_get_cc_list() {
				$args = array(
					'post_type'			=> 'bt-cost-calculator',
					'post_status'		=> 'publish',
					'posts_per_page'	=> -1
				);
				$cost_calculators = new WP_Query($args);

				$cost_calculators_data = array();	
				if ( isset( $cost_calculators ) && $cost_calculators->have_posts() ) {
					while ( $cost_calculators->have_posts() ) {			
						$cost_calculators->the_post();
						$post		= get_post();
						$post_id	= get_the_ID();

						$posts_data			= array();
						$post_data['ID']	= $post_id;
						$post_data['title'] = get_the_title( $post_id );
						$cost_calculators_data[]	= $post_data;
					}
					wp_reset_postdata();			
				} 
				
				$cost_calculators_arr = array( esc_html__( '', 'bt-cost-calculator' ) => '0' );
				foreach ( $cost_calculators_data as $item) {	
					if ( $item ) {	
						$cost_calculators_arr[$item["title"]] =   $item["ID"] ;
					}
				}
				
				return $cost_calculators_arr;
			}

	}

	new bt_bb_cc_element();

	// require_once wp_normalize_path(  __DIR__ . '/../bb/index.php' );

}

